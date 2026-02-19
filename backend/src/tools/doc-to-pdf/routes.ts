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
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'application/msword' ||
            file.originalname.endsWith('.docx') ||
            file.originalname.endsWith('.doc')) {
            cb(null, true);
        } else {
            cb(new Error('Only allowed doc/docx files'));
        }
    }
});

router.post('/convert', upload.single('file'), convertDocToPdf);

export default router;
