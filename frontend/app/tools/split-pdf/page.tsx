'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, FileText, Scissors, Layers, Plus, Merge, FileOutput, Settings, X } from 'lucide-react';

const SortableRangeItem = dynamic(() => import('@/components/split-pdf/SortableRangeItem'), { ssr: false });
const PdfPageThumbnail = dynamic(() => import('@/components/split-pdf/PdfPageThumbnail'), { ssr: false });

type SplitMode = 'range' | 'pages';
type RangeSubMode = 'custom' | 'fixed';
type PagesSubMode = 'all' | 'select';

interface PageRange {
    id: string;
    from: number;
    to: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const RANGE_COLORS = [
    'bg-blue-100 border-blue-400',
    'bg-green-100 border-green-400',
    'bg-purple-100 border-purple-400',
    'bg-amber-100 border-amber-400',
    'bg-rose-100 border-rose-400',
    'bg-cyan-100 border-cyan-400',
    'bg-orange-100 border-orange-400',
    'bg-pink-100 border-pink-400',
];

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
            if (from < 1 || from > totalPages || to < 1 || to > totalPages) {
                return { pages: [], error: `Range "${part}": pages must be between 1 and ${totalPages}.` };
            }
            if (from > to) {
                return { pages: [], error: `Range "${part}": from page cannot be greater than to page.` };
            }
            for (let i = from; i <= to; i++) {
                pages.add(i);
            }
        } else {
            const pageNum = parseInt(part, 10);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                return { pages: [], error: `Invalid page number: "${part}".` };
            }
            pages.add(pageNum);
        }
    }

    return { pages: Array.from(pages).sort((a, b) => a - b) };
}

export default function SplitPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [mode, setMode] = useState<SplitMode>('range');
    const [rangeSubMode, setRangeSubMode] = useState<RangeSubMode>('custom');
    const [pagesSubMode, setPagesSubMode] = useState<PagesSubMode>('all');
    const [ranges, setRanges] = useState<PageRange[]>([{ id: generateId(), from: 1, to: 0 }]);
    const [pagesPerFile, setPagesPerFile] = useState<string>('1');
    const [pageNumbers, setPageNumbers] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDraggingOnWindow, setIsDraggingOnWindow] = useState(false);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [mergeRanges, setMergeRanges] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [lastClickedPage, setLastClickedPage] = useState<number | null>(null);
    const [currentRangeIndex, setCurrentRangeIndex] = useState<number>(0);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDraggingOnWindow(true);
            }
        };

        const handleWindowDragLeave = (e: DragEvent) => {
            if (e.relatedTarget === null) {
                setIsDraggingOnWindow(false);
            }
        };

        const handleWindowDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDraggingOnWindow(false);
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const droppedFile = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf');
                if (droppedFile) {
                    handleFileSelect(droppedFile);
                }
            }
        };

        window.addEventListener('dragover', handleWindowDragOver);
        window.addEventListener('dragleave', handleWindowDragLeave);
        window.addEventListener('drop', handleWindowDrop);

        return () => {
            window.removeEventListener('dragover', handleWindowDragOver);
            window.removeEventListener('dragleave', handleWindowDragLeave);
            window.removeEventListener('drop', handleWindowDrop);
        };
    }, []);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setIsLoadingPages(true);
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(pdf);
            const pageCount = pdf.numPages;
            setTotalPages(pageCount);
            setRanges([{ id: generateId(), from: 1, to: pageCount }]);
        } catch (error) {
            console.error('Error reading PDF:', error);
            alert('Failed to read PDF file.');
        } finally {
            setIsLoadingPages(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleAddRange = () => {
        const newRange: PageRange = { id: generateId(), from: 1, to: totalPages };
        setRanges(prev => [...prev, newRange]);
        setCurrentRangeIndex(ranges.length);
    };

    const handleRemoveRange = (id: string) => {
        if (ranges.length > 1) {
            setRanges(prev => {
                const newRanges = prev.filter(r => r.id !== id);
                if (currentRangeIndex >= newRanges.length) {
                    setCurrentRangeIndex(Math.max(0, newRanges.length - 1));
                }
                return newRanges;
            });
        }
    };

    const handleRangeChange = (id: string, field: 'from' | 'to', value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setRanges(prev => prev.map(r => r.id === id ? { ...r, [field]: numValue } : r));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setRanges(items => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handlePageClick = useCallback((pageNum: number, shiftKey: boolean) => {
        // Only handle visual selection in "Pages → Select" mode,
        // so behavior matches "Remove PDF Pages" tool.
        if (mode === 'pages' && pagesSubMode === 'select') {
            setSelectedPages(prev => {
                const newSet = new Set(prev);

                if (shiftKey && lastClickedPage !== null) {
                    const start = Math.min(lastClickedPage, pageNum);
                    const end = Math.max(lastClickedPage, pageNum);
                    for (let p = start; p <= end; p++) {
                        newSet.add(p);
                    }
                } else {
                    if (newSet.has(pageNum)) {
                        newSet.delete(pageNum);
                    } else {
                        newSet.add(pageNum);
                    }
                }

                const pages = Array.from(newSet).sort((a, b) => a - b);
                setPageNumbers(pages.join(', '));

                return newSet;
            });
            if (!shiftKey) {
                setLastClickedPage(pageNum);
            }
        }
    }, [mode, pagesSubMode, lastClickedPage]);

    const selectedPageCount = useMemo(() => {
        if (mode === 'pages' && pagesSubMode === 'select') {
            if (pageNumbers.trim()) {
                const result = parsePageInput(pageNumbers, totalPages);
                return result.pages.length;
            }
            return 0;
        }
        return selectedPages.size;
    }, [pageNumbers, totalPages, mode, pagesSubMode, selectedPages]);

    const handlePageNumbersChange = useCallback((value: string) => {
        setPageNumbers(value);
        if (value.trim()) {
            const result = parsePageInput(value, totalPages);
            setSelectedPages(new Set(result.pages));
        } else {
            setSelectedPages(new Set());
        }
    }, [totalPages]);

    const getPageHighlight = useCallback((pageNum: number): { highlight: boolean; color?: string; rangeIndex?: number } => {
        if (mode === 'range' && rangeSubMode === 'custom') {
            for (let i = 0; i < ranges.length; i++) {
                if (pageNum >= ranges[i].from && pageNum <= ranges[i].to) {
                    return { highlight: true, color: RANGE_COLORS[i % RANGE_COLORS.length], rangeIndex: i };
                }
            }
        } else if (mode === 'pages' && pagesSubMode === 'select') {
            if (selectedPages.has(pageNum)) {
                return { highlight: true, color: 'bg-purple-100 border-purple-400' };
            }
        }
        return { highlight: false };
    }, [mode, rangeSubMode, pagesSubMode, ranges, selectedPages]);

    const validateRanges = (): { valid: boolean; error?: string } => {
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            if (r.from < 1) {
                return { valid: false, error: `Range ${i + 1}: From page must be at least 1.` };
            }
            if (r.from > totalPages) {
                return { valid: false, error: `Range ${i + 1}: From page (${r.from}) exceeds total pages (${totalPages}).` };
            }
            if (r.to > totalPages) {
                return { valid: false, error: `Range ${i + 1}: To page (${r.to}) exceeds total pages (${totalPages}).` };
            }
            if (r.from > r.to) {
                return { valid: false, error: `Range ${i + 1}: From page (${r.from}) cannot be greater than to page (${r.to}).` };
            }
        }
        return { valid: true };
    };

    const handleSplitCustomRanges = async () => {
        if (!file) return;
        const validation = validateRanges();
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ranges', JSON.stringify(ranges.map(r => ({ from: r.from, to: r.to }))));
        formData.append('mergeRanges', String(mergeRanges));

        try {
            const response = await fetch('/api/tools/split-pdf/custom-ranges', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Split failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = mergeRanges ? 'merged_ranges.pdf' : 'split_ranges.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to split PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSplitFixedRange = async () => {
        if (!file) return;

        const pages = parseInt(pagesPerFile, 10);
        if (isNaN(pages) || pages < 1) {
            alert('Please enter a valid number of pages per file.');
            return;
        }
        if (pages > totalPages) {
            alert(`Pages per file (${pages}) exceeds total pages (${totalPages}).`);
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pagesPerFile', pagesPerFile);

        try {
            const response = await fetch('/api/tools/split-pdf/fixed-range', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Split failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'split_fixed.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to split PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExtractPages = async () => {
        if (!file) return;

        if (!pageNumbers.trim()) {
            alert('Please enter page numbers to extract.');
            return;
        }

        const result = parsePageInput(pageNumbers, totalPages);
        if (result.error) {
            alert(result.error);
            return;
        }
        if (result.pages.length === 0) {
            alert('No valid pages to extract.');
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pages', pageNumbers);

        try {
            const response = await fetch('/api/tools/split-pdf/pages', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Split failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'extracted_pages.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to split PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSplitAll = async () => {
        if (!file) return;
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/tools/split-pdf/all', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Split failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'all_pages.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to split PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateFixedParts = () => {
        const pages = parseInt(pagesPerFile, 10) || 1;
        return Math.ceil(totalPages / pages);
    };

    const handleMainAction = () => {
        if (mode === 'range') {
            if (rangeSubMode === 'custom') {
                handleSplitCustomRanges();
            } else {
                handleSplitFixedRange();
            }
        } else {
            if (pagesSubMode === 'all') {
                handleSplitAll();
            } else {
                handleExtractPages();
            }
        }
    };

    const getButtonText = () => {
        if (mode === 'range') {
            if (rangeSubMode === 'custom') {
                return mergeRanges ? 'Merge All Ranges' : `Split ${ranges.length} Range(s)`;
            }
            return `Split into ${calculateFixedParts()} Files`;
        }
        if (pagesSubMode === 'all') {
            return `Extract All ${totalPages} Pages`;
        }
        return `Extract ${selectedPageCount} Page(s)`;
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col relative">
            {isDraggingOnWindow && !file && (
                <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
                        <UploadCloud className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="absolute mt-32 text-2xl font-bold text-blue-600 bg-white/80 px-6 py-2 rounded-full">
                        Drop PDF anywhere
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">Split PDF</h1>
                    {file && (
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="max-w-[150px] lg:max-w-[200px] truncate">{file.name}</span>
                            <span className="shrink-0">({totalPages} pages)</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {file && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 hidden sm:flex" onClick={() => { 
                            setFile(null); 
                            setPdfDoc(null);
                            setTotalPages(0); 
                            setRanges([{ id: generateId(), from: 1, to: 0 }]);
                            setSelectedPages(new Set());
                        }}>
                            Remove
                        </Button>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                        aria-label="Toggle settings"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left: PDF Preview Grid */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden h-full p-3 sm:p-4 scroll-smooth">
                    {!file ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Upload a PDF to Split</h2>
                                <p className="text-slate-500">Drag & drop or click to select a file</p>
                            </div>
                            <label className="w-full max-w-md px-4 cursor-pointer">
                                <div className="w-full h-40 sm:h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 hover:border-blue-400 transition-colors flex flex-col items-center justify-center group">
                                    <div className="bg-blue-50 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <UploadCloud className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Drop PDF file here</p>
                                    <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileInput} />
                                </div>
                            </label>
                        </div>
                    ) : isLoadingPages ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-3 text-slate-600">Loading PDF...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                            {pdfDoc && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                const { highlight, color, rangeIndex } = getPageHighlight(pageNum);
                                const isCurrentRange = mode === 'range' && rangeSubMode === 'custom' && rangeIndex === currentRangeIndex;
                                
                                return (
                                    <div
                                        key={pageNum}
                                        onClick={(e) => handlePageClick(pageNum, e.shiftKey)}
                                        className={`relative bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                                            highlight ? color : 'border-slate-200 hover:border-slate-300'
                                        } ${isCurrentRange ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                    >
                                        <div className="aspect-[3/4] relative bg-slate-100">
                                            <PdfPageThumbnail 
                                                pdfDoc={pdfDoc} 
                                                pageNum={pageNum}
                                            />
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center font-medium">
                                            {pageNum}
                                        </div>
                                        {mode === 'range' && rangeSubMode === 'custom' && highlight && (
                                            <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                rangeIndex !== undefined ? ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500'][rangeIndex % 8] : 'bg-slate-400'
                                            } text-white`}>
                                                {(rangeIndex ?? 0) + 1}
                                            </div>
                                        )}
                                        {mode === 'pages' && pagesSubMode === 'select' && highlight && (
                                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Settings Sidebar */}
                <div className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-slate-200 flex flex-col h-full transform transition-transform lg:transform-none z-50 ${
                    sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                }`}>
                    {/* Mobile overlay */}
                    {sidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/30 lg:hidden z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                    
                    {/* Mobile Sidebar Header */}
                    <div className="lg:hidden flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
                        <span className="font-semibold text-slate-700">Settings</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-slate-200 rounded-lg"
                            aria-label="Close settings"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-3 sm:p-4 border-b border-slate-200">
                        {/* Mode Selection */}
                        <div className="flex gap-2 mb-3">
                            <button 
                                onClick={() => setMode('range')} 
                                className={`flex-1 p-2 sm:p-3 rounded-lg border-2 transition-all ${mode === 'range' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                            >
                                <Scissors className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                                <p className="text-xs font-medium text-slate-700">Range</p>
                            </button>
                            <button 
                                onClick={() => setMode('pages')} 
                                className={`flex-1 p-2 sm:p-3 rounded-lg border-2 transition-all ${mode === 'pages' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                            >
                                <Layers className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                                <p className="text-xs font-medium text-slate-700">Pages</p>
                            </button>
                        </div>

                        {/* Action Button - Always visible */}
                        <Button
                            size="lg"
                            className="w-full font-bold shadow-lg shadow-blue-500/20"
                            onClick={handleMainAction}
                            disabled={isProcessing || !file}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Scissors className="w-4 h-4 mr-2" />
                                    {file ? getButtonText() : 'Split PDF'}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Scrollable Settings Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 pb-20 lg:pb-4 scroll-smooth">
                        {/* Range Mode Settings */}
                        {mode === 'range' && (
                            <>
                                <div className="flex gap-2 mb-3">
                                    <button 
                                        onClick={() => setRangeSubMode('custom')} 
                                        className={`flex-1 p-2 rounded-lg border text-xs transition-all ${rangeSubMode === 'custom' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        Custom
                                    </button>
                                    <button 
                                        onClick={() => setRangeSubMode('fixed')} 
                                        className={`flex-1 p-2 rounded-lg border text-xs transition-all ${rangeSubMode === 'fixed' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        Fixed
                                    </button>
                                </div>

                                {rangeSubMode === 'custom' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-700">Ranges</span>
                                            <Button variant="outline" size="sm" onClick={handleAddRange} className="h-6 text-xs gap-1 px-2">
                                                <Plus className="w-3 h-3" /> Add
                                            </Button>
                                        </div>

                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={ranges.map(r => r.id)} strategy={verticalListSortingStrategy}>
                                                <div className="space-y-1">
                                                    {ranges.map((range, index) => (
                                                        <SortableRangeItem
                                                            key={range.id}
                                                            id={range.id}
                                                            index={index}
                                                            range={{ id: range.id, from: String(range.from), to: String(range.to) }}
                                                            totalPages={totalPages}
                                                            onRangeChange={(id, field, value) => handleRangeChange(id, field, value)}
                                                            onRemove={handleRemoveRange}
                                                            canRemove={ranges.length > 1}
                                                            isActive={index === currentRangeIndex}
                                                            onClick={() => setCurrentRangeIndex(index)}
                                                            colorClass={RANGE_COLORS[index % RANGE_COLORS.length]}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>

                                        <p className="text-xs text-slate-400">Click a range, then click pages to adjust.</p>

                                        <div className="flex items-center gap-2 pt-2 border-t">
                                            <input
                                                type="checkbox"
                                                id="mergeRanges"
                                                checked={mergeRanges}
                                                onChange={(e) => setMergeRanges(e.target.checked)}
                                                className="w-3 h-3 rounded border-slate-300"
                                            />
                                            <label htmlFor="mergeRanges" className="text-xs text-slate-600 flex items-center gap-1">
                                                <Merge className="w-3 h-3" /> Merge ranges into one PDF
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {rangeSubMode === 'fixed' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-600">Pages per file:</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={totalPages}
                                            value={pagesPerFile}
                                            onChange={(e) => setPagesPerFile(e.target.value)}
                                            className="w-full h-8"
                                        />
                                        <p className="text-slate-500 text-xs bg-slate-50 p-2 rounded">
                                            <FileOutput className="w-3 h-3 inline mr-1" />
                                            {calculateFixedParts()} PDF(s) will be created.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Pages Mode Settings */}
                        {mode === 'pages' && (
                            <>
                                <div className="flex gap-2 mb-3">
                                    <button 
                                        onClick={() => setPagesSubMode('all')} 
                                        className={`flex-1 p-2 rounded-lg border text-xs transition-all ${pagesSubMode === 'all' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        All Pages
                                    </button>
                                    <button 
                                        onClick={() => setPagesSubMode('select')} 
                                        className={`flex-1 p-2 rounded-lg border text-xs transition-all ${pagesSubMode === 'select' ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        Select
                                    </button>
                                </div>

                                {pagesSubMode === 'all' && (
                                    <p className="text-slate-500 text-xs bg-purple-50 p-2 rounded">
                                        <Layers className="w-3 h-3 inline mr-1" />
                                        {totalPages} PDF(s) will be created.
                                    </p>
                                )}

                                {pagesSubMode === 'select' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-600">Pages to extract:</label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., 1, 2, 3-6, 8"
                                            value={pageNumbers}
                                            onChange={(e) => handlePageNumbersChange(e.target.value)}
                                            className="w-full h-8"
                                        />
                                        <p className="text-xs text-slate-400">Or click pages in preview to select.</p>
                                        <p className="text-slate-500 text-xs bg-purple-50 p-2 rounded">
                                            <Layers className="w-3 h-3 inline mr-1" />
                                            {selectedPageCount} PDF(s) will be created.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}