import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';

export const imageToPdfHandler = async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images provided' });
    }

    try {
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
            let image;
            // Detect image type closely
            if (file.mimetype === 'image/jpeg' || file.originalname.toLowerCase().endsWith('.jpg') || file.originalname.toLowerCase().endsWith('.jpeg')) {
                image = await pdfDoc.embedJpg(file.buffer);
            } else if (file.mimetype === 'image/png' || file.originalname.toLowerCase().endsWith('.png')) {
                image = await pdfDoc.embedPng(file.buffer);
            } else {
                // Skip unsupported formats or throw specific error
                console.warn(`Skipping unsupported file type: ${file.mimetype} - ${file.originalname}`);
                continue;
            }

            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // Send response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=images.pdf');
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Image to PDF error:', error);
        res.status(500).json({ error: 'Conversion failed', details: (error as Error).message });
    }
};
