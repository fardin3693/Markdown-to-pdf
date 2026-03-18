import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import routes from './routes';
import compressRoutes from './tools/compress-pdf/routes';
import { getBrowser, closeBrowser } from './lib/browser';
import { initLibreOffice } from './lib/libreoffice';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200
}));

// Only markdown-to-pdf sends a JSON body (plain text), so 10 MB is more than
// enough. PDF binaries are uploaded via multipart/form-data handled by Multer
// and are NOT affected by this limit.
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Static assets
// Serves locally-bundled CSS/JS so Puppeteer never fetches from external CDNs.
// ---------------------------------------------------------------------------
// __dirname is backend/src at runtime (ts-node); assets live at backend/src/assets/
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', routes);
app.use('/api', compressRoutes);

// ---------------------------------------------------------------------------
// Stale-upload cleanup
// Delete files in uploads/ that are older than 1 hour on startup.
// These are leftovers from requests that were interrupted or crashed.
// ---------------------------------------------------------------------------
async function cleanStaleUploads(): Promise<void> {
    // __dirname is backend/src at runtime (ts-node); uploads/ lives at backend/uploads/
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
        await fs.ensureDir(uploadsDir);
        const files = await fs.readdir(uploadsDir);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        let cleaned = 0;
        for (const file of files) {
            const filePath = path.join(uploadsDir, file);
            try {
                const stat = await fs.stat(filePath);
                if (stat.isFile() && stat.mtimeMs < oneHourAgo) {
                    await fs.unlink(filePath);
                    cleaned++;
                }
            } catch {
                // File may have already been removed – ignore
            }
        }
        if (cleaned > 0) {
            console.log(`[Startup] Cleaned ${cleaned} stale file(s) from uploads/`);
        }
    } catch (err) {
        console.warn('[Startup] Could not clean uploads dir:', (err as Error).message);
    }
}

// ---------------------------------------------------------------------------
// Startup initialisation
// ---------------------------------------------------------------------------
async function init(): Promise<void> {
    // Clean up stale uploads from any previous crashes
    await cleanStaleUploads();

    // Eagerly resolve LibreOffice path once so every subsequent request is instant
    await initLibreOffice();

    // Warm up the Puppeteer browser so the first conversion is not slow
    try {
        await getBrowser();
    } catch (err) {
        console.warn('[Startup] Could not pre-launch browser:', (err as Error).message);
    }

    // Log Python path status
    const pythonPath = process.env.PYTHON_PATH || 'C:\\Users\\fardi\\AppData\\Local\\Programs\\Python\\Python314\\python.exe';
    if (!process.env.PYTHON_PATH) {
        console.warn(`[Python] PYTHON_PATH env variable not set – using default: ${pythonPath}`);
    } else {
        console.log(`[Python] Using PYTHON_PATH: ${pythonPath}`);
    }
}

// ---------------------------------------------------------------------------
// Graceful shutdown – close the shared Chromium browser cleanly
// ---------------------------------------------------------------------------
process.on('SIGTERM', async () => {
    console.log('[Shutdown] SIGTERM received – closing browser...');
    await closeBrowser();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('[Shutdown] SIGINT received – closing browser...');
    await closeBrowser();
    process.exit(0);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    await init();
});
