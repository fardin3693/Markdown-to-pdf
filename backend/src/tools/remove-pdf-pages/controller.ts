import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';

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

export const removePages = async (req: Request, res: Response) => {
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

        const pagesToRemove = result.pages!;
        if (pagesToRemove.length === 0) {
            return res.status(400).json({ error: 'No pages specified to remove.' });
        }

        if (pagesToRemove.length === totalPages) {
            return res.status(400).json({ error: 'Cannot remove all pages. At least one page must remain.' });
        }

        const pagesToRemoveSet = new Set(pagesToRemove.map(p => p - 1));
        
        const newPdf = await PDFDocument.create();
        const keptPageIndices: number[] = [];
        
        for (let i = 0; i < totalPages; i++) {
            if (!pagesToRemoveSet.has(i)) {
                keptPageIndices.push(i);
            }
        }

        const copiedPages = await newPdf.copyPages(sourcePdf, keptPageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        
        const removedCount = pagesToRemove.length;
        const remainingCount = totalPages - removedCount;

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="removed_pages.pdf"',
            'Content-Length': pdfBytes.length,
            'X-Removed-Pages': String(removedCount),
            'X-Remaining-Pages': String(remainingCount)
        });
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error removing pages:', error);
        res.status(500).json({
            error: 'Failed to remove pages',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
