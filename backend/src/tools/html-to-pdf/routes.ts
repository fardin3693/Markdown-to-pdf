import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { convertHtmlToPdf } from './controller';

const router = Router();

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isHtmlFile = ext === '.html' || ext === '.htm';
        const isZipFile = ext === '.zip';

        if (isHtmlFile || isZipFile) {
            cb(null, true);
            return;
        }

        cb(new Error('Only .html, .htm, or .zip files are allowed'));
    },
});

router.post('/convert', upload.single('file'), convertHtmlToPdf);

export default router;
