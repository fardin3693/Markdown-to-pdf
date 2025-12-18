import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import archiver from 'archiver';

export const pdfToImageHandler = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No PDF provided' });
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        // Pass the PDF data as base64
        const pdfBase64 = file.buffer.toString('base64');

        // Use addScriptTag to inject PDF.js and the conversion logic as raw JS
        await page.setContent(`<html><head></head><body></body></html>`);
        await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js' });

        // Wait a moment for the script to initialize
        await page.waitForFunction(() => typeof (window as any).pdfjsLib !== 'undefined', { timeout: 10000 });

        // Set the worker source
        await page.evaluate(() => {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        });

        // Now run the conversion - using Promise chains to avoid __awaiter issue
        const images = await page.evaluate((pdfData: string) => {
            return new Promise((resolve, reject) => {
                try {
                    const pdfjs = (window as any).pdfjsLib;
                    const binaryString = atob(pdfData);
                    const loadingTask = pdfjs.getDocument({ data: binaryString });

                    loadingTask.promise.then((pdf: any) => {
                        const numPages = pdf.numPages;
                        const imagePromises: Promise<string>[] = [];

                        for (let i = 1; i <= numPages; i++) {
                            imagePromises.push(
                                pdf.getPage(i).then((page: any) => {
                                    const viewport = page.getViewport({ scale: 2.0 });
                                    const canvas = document.createElement('canvas');
                                    const context = canvas.getContext('2d');
                                    if (!context) throw new Error('Could not get canvas context');

                                    canvas.height = viewport.height;
                                    canvas.width = viewport.width;

                                    return page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                                        return canvas.toDataURL('image/png');
                                    });
                                })
                            );
                        }

                        Promise.all(imagePromises).then((results) => {
                            resolve(results);
                        }).catch(reject);
                    }).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        }, pdfBase64) as string[];

        // Zip the images
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="converted_images.zip"`);

        archive.pipe(res);

        for (let i = 0; i < images.length; i++) {
            const base64Data = images[i].replace(/^data:image\/png;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            archive.append(buffer, { name: `page-${i + 1}.png` });
        }

        await archive.finalize();

    } catch (error) {
        console.error('PDF to Image error:', error);
        res.status(500).json({ error: 'Conversion failed', details: (error as Error).message });
    } finally {
        await browser.close();
    }
};
