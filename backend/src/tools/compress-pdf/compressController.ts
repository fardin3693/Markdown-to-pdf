import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { getGhostscriptModule } from '../../utils/platformUtils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compress } = require('compress-pdf');

export const compressPdfHandler = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const file = req.files[0];
        console.log('Received file:', { name: file.originalname, size: file.size, mimetype: file.mimetype });
        const compressionLevel = req.body.compressionLevel || 'standard';
        console.log('Using compressionLevel:', compressionLevel);

        const gsModule = getGhostscriptModule();

        let gsArgs: string[] = [];
        switch (compressionLevel) {
            case 'max':
                gsArgs = [
                    '-dPDFSETTINGS=/screen',
                    '-dColorImageResolution=72',
                    '-dGrayImageResolution=72',
                    '-dMonoImageResolution=72',
                    '-dColorImageDownsampleType=/Bicubic',
                    '-dGrayImageDownsampleType=/Bicubic',
                    '-dJPEGQ=50',
                    '-dCompressFonts=true',
                    '-dDetectDuplicateImages=true',
                    '-dCompressPages=true',
                    '-dNOPAUSE',
                    '-dBATCH',
                    '-dQUIET'
                ];
                break;
            case 'standard':
                gsArgs = [
                    '-dPDFSETTINGS=/ebook',
                    '-dColorImageResolution=150',
                    '-dGrayImageResolution=150',
                    '-dMonoImageResolution=150',
                    '-dColorImageDownsampleType=/Bicubic',
                    '-dGrayImageDownsampleType=/Bicubic',
                    '-dJPEGQ=70',
                    '-dCompressFonts=true',
                    '-dDetectDuplicateImages=true',
                    '-dCompressPages=true',
                    '-dNOPAUSE',
                    '-dBATCH',
                    '-dQUIET'
                ];
                break;
            case 'low':
                gsArgs = [
                    '-dPDFSETTINGS=/printer',
                    '-dColorImageResolution=300',
                    '-dGrayImageResolution=300',
                    '-dMonoImageResolution=300',
                    '-dColorImageDownsampleType=/Bicubic',
                    '-dGrayImageDownsampleType=/Bicubic',
                    '-dJPEGQ=85',
                    '-dCompressFonts=true',
                    '-dDetectDuplicateImages=true',
                    '-dCompressPages=true',
                    '-dNOPAUSE',
                    '-dBATCH',
                    '-dQUIET'
                ];
                break;
            default:
                gsArgs = [
                    '-dPDFSETTINGS=/ebook',
                    '-dJPEGQ=70',
                    '-dCompressFonts=true',
                    '-dDetectDuplicateImages=true',
                    '-dCompressPages=true',
                    '-dNOPAUSE',
                    '-dBATCH',
                    '-dQUIET'
                ];
        }

        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-compress-'));
        const inputPath = path.join(tempDir, file.originalname);
        const outputDir = path.join(tempDir, 'output');

        try {
            await fs.writeFile(inputPath, file.buffer);
            await fs.ensureDir(outputDir);

            console.log('Calling compress-pdf with gsModule:', gsModule);

            const compressedBuffer = await compress(inputPath, {
                output: outputDir,
                gsModule,
                args: gsArgs
            });

            if (!compressedBuffer) {
                throw new Error('Compression failed, no output');
            }

            const compressedSize = compressedBuffer.length;
            const originalSize = file.size;

            let finalBuffer: Buffer;
            let finalSize: number;
            let wasCompressed = true;

            if (compressedSize >= originalSize) {
                console.log('Compressed file is not smaller, returning original');
                finalBuffer = file.buffer;
                finalSize = originalSize;
                wasCompressed = false;
            } else {
                finalBuffer = compressedBuffer;
                finalSize = compressedSize;
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="compressed_${file.originalname}"`);
            res.setHeader('X-Original-Size', originalSize.toString());
            res.setHeader('X-Compressed-Size', finalSize.toString());
            res.setHeader('X-Was-Compressed', wasCompressed.toString());

            res.send(finalBuffer);

        } catch (err: any) {
            console.error('Inner compression error:', err);
            if (err.message && (
                err.message.includes('spawn gswin64c ENOENT') ||
                err.message.includes('spawn gswin32c ENOENT') ||
                err.message.includes('spawn gs ENOENT') ||
                err.message.includes('Command failed')
            )) {
                res.status(500).json({ error: 'Server Configuration Error: Ghostscript is not installed or not in PATH.' });
                return;
            }
            throw err;
        } finally {
            await fs.remove(tempDir).catch(e => console.error('Cleanup error:', e));
        }

    } catch (error) {
        console.error('Compression error:', error);
        res.status(500).json({ error: 'Failed to compress PDF', details: (error as Error).message });
    }
};
