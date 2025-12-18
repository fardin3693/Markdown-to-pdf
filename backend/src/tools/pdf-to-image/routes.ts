import { Router } from 'express';
import multer from 'multer';
import { pdfToImageHandler } from './pdfToImageController';

const router = Router();

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    }
});

// POST /convert
router.post('/convert', upload.single('file'), pdfToImageHandler);

export default router;
