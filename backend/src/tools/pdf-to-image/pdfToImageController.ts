import { Request, Response } from 'express';
import archiver from 'archiver';
import { getBrowser } from '../../lib/browser';

export const pdfToImageHandler = async (req: Request, res: Response) => {
    // Evaluated lazily (inside the handler) so dotenv.config() in index.ts has
    // already run by the time the first request arrives.
    const port = process.env.PORT || 3001;
    const PDFJS_URL = `http://localhost:${port}/assets/pdf.min.js`;
    const PDFJS_WORKER_URL = `http://localhost:${port}/assets/pdf.worker.min.js`;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No PDF provided' });
    }

    // Reuse the shared browser instance instead of launching a new one per request.
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        // Pass the PDF data as base64
        const pdfBase64 = file.buffer.toString('base64');

        // Load a blank page then inject PDF.js from the local static server.
        await page.setContent(`<html><head></head><body></body></html>`);
        await page.addScriptTag({ url: PDFJS_URL });

        // Wait for PDF.js to initialise
        await page.waitForFunction(() => typeof (window as any).pdfjsLib !== 'undefined', { timeout: 10000 });

        // Point the worker at the local copy too
        await page.evaluate((workerUrl: string) => {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        }, PDFJS_WORKER_URL);

        // Run the conversion – Promise chains used to avoid async/await transpilation issues
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
        if (!res.headersSent) {
            res.status(500).json({ error: 'Conversion failed', details: (error as Error).message });
        }
    } finally {
        // Close the page but keep the shared browser alive.
        await page.close();
    }
};
