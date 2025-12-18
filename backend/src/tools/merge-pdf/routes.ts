import { Router } from 'express';
import multer from 'multer';
import { mergePdfs } from './mergeController';

const router = Router();

// Configure Multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // Limit to 500MB per file
        files: 1000 // Limit to 1000 files
    }
});

// POST /merge - expects form-data with 'files' field
router.post('/merge', upload.array('files'), mergePdfs);

export default router;
