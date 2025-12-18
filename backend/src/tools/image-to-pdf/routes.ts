import { Router } from 'express';
import multer from 'multer';
import { imageToPdfHandler } from './imageToPdfController';

const router = Router();

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per image, adjustable
    }
});

// POST /convert
router.post('/convert', upload.array('files'), imageToPdfHandler);

export default router;
