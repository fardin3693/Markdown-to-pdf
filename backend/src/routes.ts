import { Router } from 'express';
import { convertMarkdownToPdf } from './controllers/convertController';

const router = Router();

router.post('/convert', convertMarkdownToPdf);
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
