import { Request, Response } from 'express';
import { convertToHtml } from '../services/markdownService';
import { generatePdf } from '../services/pdfService';

export const convertMarkdownToPdf = async (req: Request, res: Response) => {
    try {
        const { markdown, format, options } = req.body;

        if (!markdown && markdown !== '') {
            return res.status(400).json({ error: 'Markdown content is required' });
        }

        const html = await convertToHtml(markdown, options);

        if (format === 'html') {
            res.set({
                'Content-Type': 'text/html',
                'Content-Disposition': 'attachment; filename="output.html"',
                'Content-Length': Buffer.byteLength(html),
            });
            return res.send(html);
        }

        const pdfBuffer = await generatePdf(html, options);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="output.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};
