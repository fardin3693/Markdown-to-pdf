import { Request, Response } from 'express';
import fs from 'fs-extra';
import { convertHtmlInputToPdf, HtmlToPdfOptions, UrlValidationError } from './service';

const parseOptions = (rawOptions: unknown): HtmlToPdfOptions => {
    if (!rawOptions) {
        return {};
    }

    if (typeof rawOptions === 'string') {
        try {
            return JSON.parse(rawOptions) as HtmlToPdfOptions;
        } catch (error) {
            throw new Error('Invalid options JSON payload');
        }
    }

    if (typeof rawOptions === 'object') {
        return rawOptions as HtmlToPdfOptions;
    }

    throw new Error('Invalid options format');
};

export const convertHtmlToPdf = async (req: Request, res: Response) => {
    let uploadPath: string | undefined;

    try {
        uploadPath = req.file?.path;
        const options = parseOptions(req.body.options);

        const rawMode = req.body.mode;
        const mode = typeof rawMode === 'string' ? rawMode : uploadPath ? 'upload' : 'html';

        if (mode === 'url') {
            const url = typeof req.body.url === 'string' ? req.body.url.trim() : '';
            if (!url) {
                return res.status(400).json({ error: 'No URL provided. Please supply a URL, e.g. https://example.com' });
            }

            const pdfBuffer = await convertHtmlInputToPdf({ mode: 'url', url, options });
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="website.pdf"',
                'Content-Length': pdfBuffer.length,
            });
            return res.send(pdfBuffer);
        }

        if (uploadPath) {
            const originalName = req.file?.originalname || 'document.html';
            const pdfBuffer = await convertHtmlInputToPdf({ mode: 'upload', uploadPath, originalName, options });
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="html-file.pdf"',
                'Content-Length': pdfBuffer.length,
            });
            return res.send(pdfBuffer);
        }

        const html = typeof req.body.html === 'string' ? req.body.html : '';
        if (!html.trim()) {
            return res.status(400).json({ error: 'HTML content is required for HTML mode' });
        }

        const pdfBuffer = await convertHtmlInputToPdf({ mode: 'html', html, options });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="html-content.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error('Error converting HTML to PDF:', error);
        if (error instanceof UrlValidationError) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({
            error: 'Failed to convert HTML to PDF',
            details: error instanceof Error ? error.message : String(error),
        });
    } finally {
        if (uploadPath && await fs.pathExists(uploadPath)) {
            try {
                await fs.unlink(uploadPath);
            } catch (cleanupError) {
                console.error('Error cleaning uploaded file:', cleanupError);
            }
        }
    }
};
