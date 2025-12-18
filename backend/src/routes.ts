import { Router } from 'express';
import markdownToPdfRoutes from './tools/markdown-to-pdf/routes';
import mergePdfRoutes from './tools/merge-pdf/routes';
import imageToPdfRoutes from './tools/image-to-pdf/routes';
import pdfToImageRoutes from './tools/pdf-to-image/routes';

const router = Router();

// Tool Routes
router.use('/tools/markdown-to-pdf', markdownToPdfRoutes);
router.use('/tools/merge-pdf', mergePdfRoutes);
router.use('/tools/image-to-pdf', imageToPdfRoutes);
router.use('/tools/pdf-to-image', pdfToImageRoutes);

// Legacy/Root mounts (if needed for API simplification)
router.use('/', markdownToPdfRoutes); // Exposes /convert
router.use('/', mergePdfRoutes);      // Exposes /merge


router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
