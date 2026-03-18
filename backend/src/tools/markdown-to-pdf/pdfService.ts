import { PDFMargin } from 'puppeteer';
import { getBrowser } from '../../lib/browser';

interface PDFOptions {
    margins?: 'normal' | 'narrow' | 'wide' | 'none' | PDFMargin;
    pageSize?: string;
}

export const generatePdf = async (html: string, options: PDFOptions = {}): Promise<Buffer> => {
    // Reuse the shared browser instance instead of launching a new one per request.
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        // Assets are served locally so 'load' is sufficient – no external network wait.
        await page.setContent(html, { waitUntil: 'load' });

        // Default margins
        let pdfMargins: PDFMargin = { top: '25mm', bottom: '25mm', left: '25mm', right: '25mm' }; // Normal

        if (typeof options.margins === 'object') {
            pdfMargins = options.margins;
        } else if (typeof options.margins === 'string') {
            if (options.margins === 'narrow') {
                pdfMargins = { top: '12.7mm', bottom: '12.7mm', left: '12.7mm', right: '12.7mm' };
            } else if (options.margins === 'wide') {
                pdfMargins = { top: '50.8mm', bottom: '50.8mm', left: '50.8mm', right: '50.8mm' };
            } else if (options.margins === 'none') {
                pdfMargins = { top: '0', bottom: '0', left: '0', right: '0' };
            }
        }

        const pdfBuffer = await page.pdf({
            format: (options.pageSize as any) || 'A4',
            printBackground: true,
            margin: pdfMargins,
        });

        return Buffer.from(pdfBuffer);
    } finally {
        // Always close the page to free browser resources, but keep the browser alive.
        await page.close();
    }
};
