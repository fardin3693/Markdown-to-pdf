import puppeteer, { PDFMargin } from 'puppeteer';

interface PDFOptions {
    margins?: 'normal' | 'narrow' | 'wide' | 'none' | PDFMargin;
    pageSize?: string;
}

export const generatePdf = async (html: string, options: PDFOptions = {}): Promise<Buffer> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

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

    await browser.close();
    return Buffer.from(pdfBuffer);
};
