import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compress } = require('compress-pdf');

export const compressPdfHandler = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const file = req.files[0];
        console.log('Received file:', { name: file.originalname, size: file.size, mimetype: file.mimetype });
        const compressionLevel = req.body.compressionLevel || 'ebook';

        // Map frontend levels to compress-pdf settings (Ghostscript presets)
        let gsSetting = 'ebook';
        switch (compressionLevel) {
            case 'max':
                gsSetting = 'screen';
                break;
            case 'standard':
                gsSetting = 'ebook';
                break;
            case 'low':
                gsSetting = 'printer';
                break;
            default:
                gsSetting = 'ebook';
        }

        // Temporary directory for processing
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-compress-'));
        const inputPath = path.join(tempDir, file.originalname);
        const outputDir = path.join(tempDir, 'output');

        try {
            // Write buffer to temp file
            await fs.writeFile(inputPath, file.buffer);
            await fs.ensureDir(outputDir);

            // Compress
            console.log('Calling compress-pdf with:', { inputPath, outputDir, gsModule: 'gswin64c' });
            // compress-pdf returns a Buffer in this configuration
            const compressedBuffer = await compress(inputPath, {
                output: outputDir,
                gsModule: 'gswin64c',
                args: ['-dPDFSETTINGS=/' + gsSetting]
            });
            console.log('Compression successful.');

            if (!compressedBuffer) {
                throw new Error('Compression failed, no output');
            }

            const compressedSize = compressedBuffer.length;
            const originalSize = file.size;

            // Send response with metadata for frontend to show stats
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="compressed_${file.originalname}"`);
            res.setHeader('X-Original-Size', originalSize.toString());
            res.setHeader('X-Compressed-Size', compressedSize.toString());

            res.send(compressedBuffer);

        } catch (err: any) {
            console.error('Inner compression error:', err);

            // Check for specific Ghostscript errors
            if (err.message && (err.message.includes('spawn gswin64c ENOENT') || err.message.includes('spawn gs ENOENT') || err.message.includes('Command failed'))) {
                res.status(500).json({ error: 'Server Configuration Error: Ghostscript is not installed or not in PATH.' });
                return;
            }
            throw err;
        } finally {
            // Cleanup
            await fs.remove(tempDir).catch(e => console.error('Cleanup error:', e));
        }

    } catch (error) {
        console.error('Compression error:', error);
        res.status(500).json({ error: 'Failed to compress PDF', details: (error as Error).message });
    }
};
