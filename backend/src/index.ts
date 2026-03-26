import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';
import compressRoutes from './tools/compress-pdf/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    'http://0.0.0.0:5000',
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
        const isReplitDev = origin.endsWith('.replit.dev') || origin.endsWith('.janeway.replit.dev') || origin.includes('.replit.dev');
        const isAllowed = isLocalhost || isReplitDev || allowedOrigins.includes(origin);
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error(`CORS not allowed for origin: ${origin}`));
        }
    },
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

app.use('/api', routes);
app.use('/api', compressRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
