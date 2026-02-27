import { Router } from 'express';
import multer from 'multer';
import { removePages } from './controller';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 1
    }
});

router.post('/remove-pages', upload.single('file'), removePages);

export default router;
