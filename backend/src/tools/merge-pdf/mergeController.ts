import { Request, Response } from 'express';
// @ts-ignore
import PDFMerger from 'pdf-merger-js';
// Multer is handled in the route definition or a separate middleware file, 
// here we receive the files in req.files

export const mergePdfs = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length < 2) {
            return res.status(400).json({ error: 'Please upload at least 2 PDF files to merge.' });
        }

        const merger = new PDFMerger();

        for (const file of files) {
            // pdf-merger-js supports adding from buffer
            await merger.add(file.buffer);
        }

        const mergedPdfBuffer = await merger.saveAsBuffer();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="merged_document.pdf"',
            'Content-Length': mergedPdfBuffer.length,
        });

        res.send(mergedPdfBuffer);

    } catch (error) {
        console.error('Error merging PDFs:', error);
        res.status(500).json({
            error: 'Failed to merge PDFs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
