import { Router } from 'express';
import multer from 'multer';
import { compressPdfHandler } from './compressController';

const router = Router();

// Configure Multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // Limit to 500MB per file
    }
});

// POST /compress
router.post('/compress', upload.array('files'), compressPdfHandler);

export default router;
