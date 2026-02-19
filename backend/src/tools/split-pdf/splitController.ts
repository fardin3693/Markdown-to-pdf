import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import archiver from 'archiver';

interface PageRange {
    from: number;
    to: number;
}

export const splitByCustomRanges = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { ranges, mergeRanges } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        let parsedRanges: PageRange[];
        try {
            parsedRanges = JSON.parse(ranges);
        } catch {
            return res.status(400).json({ error: 'Invalid ranges format.' });
        }

        if (!Array.isArray(parsedRanges) || parsedRanges.length === 0) {
            return res.status(400).json({ error: 'At least one range is required.' });
        }

        const sourcePdf = await PDFDocument.load(file.buffer);
        const totalPages = sourcePdf.getPageCount();

        for (let i = 0; i < parsedRanges.length; i++) {
            const r = parsedRanges[i];
            if (r.from < 1 || r.from > totalPages) {
                return res.status(400).json({ error: `Range ${i + 1}: from page (${r.from}) is out of bounds. PDF has ${totalPages} pages.` });
            }
            if (r.to < 1 || r.to > totalPages) {
                return res.status(400).json({ error: `Range ${i + 1}: to page (${r.to}) is out of bounds. PDF has ${totalPages} pages.` });
            }
            if (r.from > r.to) {
                return res.status(400).json({ error: `Range ${i + 1}: from page (${r.from}) cannot be greater than to page (${r.to}).` });
            }
        }

        const shouldMerge = mergeRanges === 'true' || mergeRanges === true;

        if (shouldMerge) {
            const mergedPdf = await PDFDocument.create();
            
            for (const range of parsedRanges) {
                const pageIndices: number[] = [];
                for (let i = range.from - 1; i < range.to; i++) {
                    pageIndices.push(i);
                }
                const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="merged_ranges.pdf"',
                'Content-Length': pdfBytes.length,
            });
            res.send(Buffer.from(pdfBytes));
        } else {
            const archive = archiver('zip', { zlib: { level: 9 } });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="split_ranges.zip"');
            archive.pipe(res);

            for (let idx = 0; idx < parsedRanges.length; idx++) {
                const range = parsedRanges[idx];
                const newPdf = await PDFDocument.create();
                const pageIndices: number[] = [];
                for (let i = range.from - 1; i < range.to; i++) {
                    pageIndices.push(i);
                }
                const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                archive.append(Buffer.from(pdfBytes), { name: `range_${idx + 1}_pages_${range.from}-${range.to}.pdf` });
            }

            await archive.finalize();
        }

    } catch (error) {
        console.error('Error splitting PDF by custom ranges:', error);
        res.status(500).json({
            error: 'Failed to split PDF',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

export const splitByFixedRange = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { pagesPerFile } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        const pagesPerPdf = parseInt(pagesPerFile, 10);

        if (isNaN(pagesPerPdf) || pagesPerPdf < 1) {
            return res.status(400).json({ error: 'pagesPerFile must be a positive integer.' });
        }

        const sourcePdf = await PDFDocument.load(file.buffer);
        const totalPages = sourcePdf.getPageCount();

        if (pagesPerPdf > totalPages) {
            return res.status(400).json({ error: `pagesPerFile (${pagesPerPdf}) exceeds total pages (${totalPages}).` });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="split_fixed.zip"');
        archive.pipe(res);

        let fileIndex = 1;
        for (let start = 0; start < totalPages; start += pagesPerPdf) {
            const end = Math.min(start + pagesPerPdf, totalPages);
            const newPdf = await PDFDocument.create();
            const pageIndices: number[] = [];
            for (let i = start; i < end; i++) {
                pageIndices.push(i);
            }
            const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();
            archive.append(Buffer.from(pdfBytes), { name: `part_${fileIndex}_pages_${start + 1}-${end}.pdf` });
            fileIndex++;
        }

        await archive.finalize();

    } catch (error) {
        console.error('Error splitting PDF by fixed range:', error);
        res.status(500).json({
            error: 'Failed to split PDF',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

function parsePageInput(input: string, totalPages: number): { pages: number[]; error?: string } {
    const pages: Set<number> = new Set();
    const parts = input.split(',').map(p => p.trim()).filter(p => p);

    for (const part of parts) {
        if (part.includes('-')) {
            const [fromStr, toStr] = part.split('-').map(s => s.trim());
            const from = parseInt(fromStr, 10);
            const to = parseInt(toStr, 10);

            if (isNaN(from) || isNaN(to)) {
                return { pages: [], error: `Invalid range: "${part}". Use format like "3-6".` };
            }
            if (from < 1) {
                return { pages: [], error: `Range "${part}": from page must be at least 1.` };
            }
            if (from > totalPages) {
                return { pages: [], error: `Range "${part}": from page (${from}) exceeds total pages (${totalPages}).` };
            }
            if (to > totalPages) {
                return { pages: [], error: `Range "${part}": to page (${to}) exceeds total pages (${totalPages}).` };
            }
            if (from > to) {
                return { pages: [], error: `Range "${part}": from page (${from}) cannot be greater than to page (${to}).` };
            }

            for (let i = from; i <= to; i++) {
                pages.add(i);
            }
        } else {
            const pageNum = parseInt(part, 10);
            if (isNaN(pageNum)) {
                return { pages: [], error: `Invalid page number: "${part}".` };
            }
            if (pageNum < 1) {
                return { pages: [], error: `Page number ${pageNum} must be at least 1.` };
            }
            if (pageNum > totalPages) {
                return { pages: [], error: `Page number ${pageNum} exceeds total pages (${totalPages}).` };
            }
            pages.add(pageNum);
        }
    }

    return { pages: Array.from(pages).sort((a, b) => a - b) };
}

export const extractPages = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { pages } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        if (!pages || typeof pages !== 'string') {
            return res.status(400).json({ error: 'pages parameter is required.' });
        }

        const sourcePdf = await PDFDocument.load(file.buffer);
        const totalPages = sourcePdf.getPageCount();

        const result = parsePageInput(pages, totalPages);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        const pageNumbers = result.pages!;
        if (pageNumbers.length === 0) {
            return res.status(400).json({ error: 'No valid pages to extract.' });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="extracted_pages.zip"');

        archive.pipe(res);

        for (const pageNum of pageNumbers) {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            archive.append(Buffer.from(pdfBytes), { name: `page_${pageNum}.pdf` });
        }

        await archive.finalize();

    } catch (error) {
        console.error('Error extracting pages:', error);
        res.status(500).json({
            error: 'Failed to extract pages',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

export const splitAllPages = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No PDF file provided' });
        }

        const sourcePdf = await PDFDocument.load(file.buffer);
        const totalPages = sourcePdf.getPageCount();

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="all_pages.zip"');

        archive.pipe(res);

        for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, [i]);
            copiedPages.forEach(page => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            archive.append(Buffer.from(pdfBytes), { name: `page_${i + 1}.pdf` });
        }

        await archive.finalize();

    } catch (error) {
        console.error('Error splitting all pages:', error);
        res.status(500).json({
            error: 'Failed to split pages',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};