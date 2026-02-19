import { Request, Response } from 'express';
import { convertPdfToExcel } from './service';
import path from 'path';
import fs from 'fs-extra';

export const convertPdfToExcelController = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFilename = `${path.parse(req.file.filename).name}.xlsx`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    try {
        await convertPdfToExcel(inputPath, outputPath);

        res.download(outputPath, 'converted.xlsx', async (err) => {
            if (err) {
                console.error('Error sending file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to send file' });
                }
            }

            try {
                await fs.unlink(inputPath);
                if (await fs.pathExists(outputPath)) {
                    await fs.unlink(outputPath);
                }
            } catch (cleanupError) {
                console.error('Error cleaning up files:', cleanupError);
            }
        });

    } catch (error) {
        console.error('Error converting PDF to Excel:', error);

        try {
            await fs.unlink(inputPath);
        } catch (cleanupError) {
            console.error('Error cleaning up input file:', cleanupError);
        }

        res.status(500).json({
            error: 'Failed to convert PDF to spreadsheet',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
