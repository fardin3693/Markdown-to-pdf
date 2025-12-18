import { Router } from 'express';
import { convertMarkdownToPdf } from './convertController';

const router = Router();

router.post('/convert', convertMarkdownToPdf);

export default router;
