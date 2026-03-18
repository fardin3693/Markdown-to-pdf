import { Request, Response } from 'express';
import { PDFDocument, degrees } from 'pdf-lib';

/**
 * POST /api/tools/rotate-pdf/rotate-pages
 * Body: file (multipart), rotations (JSON string: { "1": 90, "3": 180, ... })
 * Rotations are absolute degrees (0, 90, 180, 270) per 1-indexed page number.
 */
export const rotatePages = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { rotations } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided.' });
        }

        if (!rotations || typeof rotations !== 'string') {
            return res.status(400).json({ error: 'rotations parameter is required.' });
        }

        let parsedRotations: Record<string, number>;
        try {
            parsedRotations = JSON.parse(rotations);
        } catch {
            return res.status(400).json({ error: 'Invalid rotations format. Expected JSON object.' });
        }

        const pdfDoc = await PDFDocument.load(file.buffer);
        const totalPages = pdfDoc.getPageCount();

        for (const [pageStr, angle] of Object.entries(parsedRotations)) {
            const pageNum = parseInt(pageStr, 10);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                return res.status(400).json({ error: `Invalid page number: ${pageStr}. PDF has ${totalPages} pages.` });
            }
            if (![0, 90, 180, 270].includes(angle)) {
                return res.status(400).json({ error: `Invalid rotation angle ${angle} for page ${pageStr}. Must be 0, 90, 180, or 270.` });
            }
            const page = pdfDoc.getPage(pageNum - 1);
            page.setRotation(degrees(angle));
        }

        const pdfBytes = await pdfDoc.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="rotated.pdf"',
            'Content-Length': pdfBytes.length,
        });
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error rotating PDF pages:', error);
        res.status(500).json({
            error: 'Failed to rotate PDF pages.',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};

/**
 * POST /api/tools/rotate-pdf/rotate-all
 * Body: file (multipart), rotation (number: 90 | 180 | 270)
 * Applies the same absolute rotation to every page.
 */
export const rotateAll = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { rotation } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided.' });
        }

        const angle = parseInt(rotation, 10);
        if (isNaN(angle) || ![90, 180, 270].includes(angle)) {
            return res.status(400).json({ error: 'rotation must be 90, 180, or 270.' });
        }

        const pdfDoc = await PDFDocument.load(file.buffer);
        const totalPages = pdfDoc.getPageCount();

        for (let i = 0; i < totalPages; i++) {
            const page = pdfDoc.getPage(i);
            // Add the requested rotation on top of the page's existing rotation
            const currentRotation = page.getRotation().angle;
            const newRotation = (currentRotation + angle) % 360;
            page.setRotation(degrees(newRotation));
        }

        const pdfBytes = await pdfDoc.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="rotated.pdf"',
            'Content-Length': pdfBytes.length,
        });
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error rotating PDF:', error);
        res.status(500).json({
            error: 'Failed to rotate PDF.',
            details: error instanceof Error ? error.message : String(error),
        });
    }
};
