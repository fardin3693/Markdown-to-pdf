import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { convertDocToPdf } from './controller';

const router = Router();

// Ensure upload directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isDocExt = ext === '.doc' || ext === '.docx';
        const allowedMimes = new Set([
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'application/octet-stream',
        ]);
        const isMimeAllowed = allowedMimes.has(file.mimetype);

        if (isDocExt && isMimeAllowed) {
            cb(null, true);
        } else {
            cb(new Error('Only .doc and .docx files are allowed'));
        }
    }
});

router.post('/convert', (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
        if (!err) {
            return next();
        }

        const message = err instanceof Error ? err.message : 'Invalid upload request';
        const status = err instanceof multer.MulterError ? 400 : 415;
        return res.status(status).json({ error: message });
    });
}, convertDocToPdf);

export default router;
