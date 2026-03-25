import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { getGhostscriptBin } from '../../runtime/runtimeDependencies';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compress } = require('compress-pdf');

export const compressPdfHandler = async (req: Request, res: Response) => {
    try {
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const file = req.files[0];
        console.log('Received file:', { name: file.originalname, size: file.size, mimetype: file.mimetype });
        console.log('Request body:', req.body);
        console.log('Raw compressionLevel from body:', req.body.compressionLevel);
        const compressionLevel = req.body.compressionLevel || 'standard';
        console.log('Using compressionLevel:', compressionLevel);

        // Map frontend levels to compress-pdf settings with enhanced parameters
        let gsArgs: string[] = [];
        switch (compressionLevel) {
            case 'max':
                // Maximum compression - lowest quality (72 dpi, JPEG quality 50)
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
                // Standard compression - balanced quality (150 dpi, JPEG quality 70)
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
                // Low compression - high quality (300 dpi, JPEG quality 85)
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
                // Default to standard
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

        // Temporary directory for processing
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-compress-'));
        const inputPath = path.join(tempDir, file.originalname);
        const outputDir = path.join(tempDir, 'output');

        try {
            // Write buffer to temp file
            await fs.writeFile(inputPath, file.buffer);
            await fs.ensureDir(outputDir);

            // Compress
            const gsModule = getGhostscriptBin();

            console.log('Calling compress-pdf with:', {
                inputPath,
                outputDir,
                gsModule,
                compressionLevel,
                argsCount: gsArgs.length
            });

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

            console.log('Compression result:', {
                originalSize,
                compressedSize,
                reduction: originalSize - compressedSize,
                reductionPercent: Math.round(((originalSize - compressedSize) / originalSize) * 100)
            });

            // If compressed file is larger or same size, return original
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

            // Send response with metadata for frontend to show stats
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="compressed_${file.originalname}"`);
            res.setHeader('X-Original-Size', originalSize.toString());
            res.setHeader('X-Compressed-Size', finalSize.toString());
            res.setHeader('X-Was-Compressed', wasCompressed.toString());

            res.send(finalBuffer);

        } catch (err: any) {
            console.error('Inner compression error:', err);

            // Check for specific Ghostscript errors
            if (err.message && (err.message.includes('ENOENT') || err.message.includes('Command failed') || err.message.includes('not available'))) {
                res.status(500).json({ error: 'Server Configuration Error: Ghostscript is not installed or not in PATH.' });
                return;
            }
            throw err;
        } finally {
            // Cleanup
            await fs.remove(tempDir).catch(e => console.error('Cleanup error:', e));
        }

    } catch (error) {
        console.error('Compression error:', error);
        res.status(500).json({ error: 'Failed to compress PDF', details: (error as Error).message });
    }
};
