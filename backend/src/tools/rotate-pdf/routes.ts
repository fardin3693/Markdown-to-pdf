import { Router } from 'express';
import multer from 'multer';
import { rotatePages, rotateAll } from './controller';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 1
    }
});

router.post('/rotate-pages', upload.single('file'), rotatePages);
router.post('/rotate-all', upload.single('file'), rotateAll);

export default router;
