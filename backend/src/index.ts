import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';
import compressRoutes from './tools/compress-pdf/routes';
import { initializeRuntimeDependencies } from './runtime/runtimeDependencies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5000',
    'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            /\.replit\.dev$/.test(origin) ||
            /\.repl\.co$/.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(new Error('CORS not allowed'), false);
    },
    optionsSuccessStatus: 200
}));
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

// Routes
app.use('/api', routes);
app.use('/api', compressRoutes);

async function bootstrap() {
    await initializeRuntimeDependencies();

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
