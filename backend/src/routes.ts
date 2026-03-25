import { Router } from 'express';
import markdownToPdfRoutes from './tools/markdown-to-pdf/routes';
import mergePdfRoutes from './tools/merge-pdf/routes';
import imageToPdfRoutes from './tools/image-to-pdf/routes';
import pdfToImageRoutes from './tools/pdf-to-image/routes';
import docToPdfRoutes from './tools/doc-to-pdf/routes';
import splitPdfRoutes from './tools/split-pdf/routes';
import pptToPdfRoutes from './tools/ppt-to-pdf/routes';
import excelToPdfRoutes from './tools/excel-to-pdf/routes';
import pdfToPptRoutes from './tools/pdf-to-ppt/routes';
import pdfToExcelRoutes from './tools/pdf-to-excel/routes';
import pdfToWordRoutes from './tools/pdf-to-word/routes';
import removePdfPagesRoutes from './tools/remove-pdf-pages/routes';
import rotatePdfRoutes from './tools/rotate-pdf/routes';
import htmlToPdfRoutes from './tools/html-to-pdf/routes';
import { getRuntimeHealth } from './runtime/runtimeDependencies';

const router = Router();

// Tool Routes
router.use('/tools/markdown-to-pdf', markdownToPdfRoutes);
router.use('/tools/merge-pdf', mergePdfRoutes);
router.use('/tools/image-to-pdf', imageToPdfRoutes);
router.use('/tools/pdf-to-image', pdfToImageRoutes);
router.use('/tools/doc-to-pdf', docToPdfRoutes);
router.use('/tools/split-pdf', splitPdfRoutes);
router.use('/tools/ppt-to-pdf', pptToPdfRoutes);
router.use('/tools/excel-to-pdf', excelToPdfRoutes);
router.use('/tools/pdf-to-ppt', pdfToPptRoutes);
router.use('/tools/pdf-to-excel', pdfToExcelRoutes);
router.use('/tools/pdf-to-word', pdfToWordRoutes);
router.use('/tools/remove-pdf-pages', removePdfPagesRoutes);
router.use('/tools/rotate-pdf', rotatePdfRoutes);
router.use('/tools/html-to-pdf', htmlToPdfRoutes);

// Legacy/Root mounts (if needed for API simplification)
router.use('/', markdownToPdfRoutes); // Exposes /convert
router.use('/', mergePdfRoutes);      // Exposes /merge


router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/runtime/health', (req, res) => {
    try {
        const runtime = getRuntimeHealth();
        const overallOk = runtime.checks.libreOffice.ok && runtime.checks.python.ok && runtime.checks.ghostscript.ok;

        res.status(overallOk ? 200 : 503).json({
            status: overallOk ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            runtime,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

export default router;
