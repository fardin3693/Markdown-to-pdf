import { Router } from 'express';
import multer from 'multer';
import { splitByCustomRanges, splitByFixedRange, extractPages, splitAllPages } from './splitController';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024,
        files: 1
    }
});

router.post('/custom-ranges', upload.single('file'), splitByCustomRanges);
router.post('/fixed-range', upload.single('file'), splitByFixedRange);
router.post('/pages', upload.single('file'), extractPages);
router.post('/all', upload.single('file'), splitAllPages);

export default router;