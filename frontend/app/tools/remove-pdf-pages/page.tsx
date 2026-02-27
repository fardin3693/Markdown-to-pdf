'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, FileText, Trash2, X, Settings } from 'lucide-react';

const PdfPageThumbnail = dynamic(() => import('@/components/split-pdf/PdfPageThumbnail'), { ssr: false });

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

export default function RemovePdfPagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pagesToRemove, setPagesToRemove] = useState<Set<number>>(new Set());
    const [lastClickedPage, setLastClickedPage] = useState<number | null>(null);
    const [pageNumbers, setPageNumbers] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDraggingOnWindow, setIsDraggingOnWindow] = useState(false);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            setTotalPages(pdf.numPages);
            setPagesToRemove(new Set());
            setPageNumbers('');
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

    const handlePageClick = useCallback((pageNum: number, shiftKey: boolean) => {
        setPagesToRemove(prev => {
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

            if (!shiftKey) {
                setLastClickedPage(pageNum);
            }

            return newSet;
        });
    }, [lastClickedPage]);

    const handlePageNumbersChange = useCallback((value: string) => {
        setPageNumbers(value);
        if (value.trim()) {
            const result = parsePageInput(value, totalPages);
            if (!result.error) {
                setPagesToRemove(new Set(result.pages));
            }
        } else {
            setPagesToRemove(new Set());
        }
    }, [totalPages]);

    const removedPageCount = useMemo(() => {
        if (pageNumbers.trim()) {
            const result = parsePageInput(pageNumbers, totalPages);
            return result.error ? 0 : result.pages.length;
        }
        return pagesToRemove.size;
    }, [pageNumbers, totalPages, pagesToRemove]);

    const remainingPageCount = totalPages - removedPageCount;

    const handleRemovePages = async () => {
        if (!file) return;

        if (!pageNumbers.trim()) {
            alert('Please select pages to remove.');
            return;
        }

        const result = parsePageInput(pageNumbers, totalPages);
        if (result.error) {
            alert(result.error);
            return;
        }

        if (result.pages.length === 0) {
            alert('No pages specified to remove.');
            return;
        }

        if (result.pages.length >= totalPages) {
            alert('Cannot remove all pages. At least one page must remain.');
            return;
        }

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pages', pageNumbers);

        try {
            const response = await fetch('/api/tools/remove-pdf-pages/remove-pages', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Remove pages failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'removed_pages.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to remove pages.');
        } finally {
            setIsProcessing(false);
        }
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

            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">Remove PDF Pages</h1>
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
                            setPagesToRemove(new Set());
                            setPageNumbers('');
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

            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-y-auto overflow-x-hidden h-full p-3 sm:p-4 scroll-smooth">
                    {!file ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Upload a PDF to Remove Pages</h2>
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
                                const isSelected = pagesToRemove.has(pageNum);
                                
                                return (
                                    <div
                                        key={pageNum}
                                        onClick={(e) => handlePageClick(pageNum, e.shiftKey)}
                                        className={`relative bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                                            isSelected ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                                        }`}
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
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/30 lg:hidden z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <div className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-80 bg-white border-l border-slate-200 flex flex-col h-full transform transition-transform lg:transform-none z-50 ${
                    sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                }`}>
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
                        <Button
                            size="lg"
                            className="w-full font-bold shadow-lg shadow-red-500/20 bg-red-500 hover:bg-red-600"
                            onClick={handleRemovePages}
                            disabled={isProcessing || !file || removedPageCount === 0 || remainingPageCount === 0}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {file ? `Remove ${removedPageCount} Page(s)` : 'Remove Pages'}
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 pb-20 lg:pb-4 scroll-smooth">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-amber-800">
                                <Trash2 className="w-4 h-4 inline mr-1" />
                                Selected pages will be <strong>removed</strong> from the PDF.
                            </p>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="text-xs text-slate-600 block mb-1">Pages to remove:</label>
                                <Input
                                    type="text"
                                    placeholder="e.g., 1, 2, 4-10"
                                    value={pageNumbers}
                                    onChange={(e) => handlePageNumbersChange(e.target.value)}
                                    className="w-full h-9"
                                />
                                <p className="text-xs text-slate-400 mt-1">Or click pages in preview to select.</p>
                            </div>
                        </div>

                        {file && (
                            <div className="bg-slate-50 rounded-lg p-3 mb-4 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Total pages:</span>
                                    <span className="font-medium">{totalPages}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Pages to remove:</span>
                                    <span className="font-medium text-red-600">{removedPageCount}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-slate-200 pt-1 mt-1">
                                    <span className="text-slate-600">Remaining pages:</span>
                                    <span className="font-medium text-green-600">{remainingPageCount}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
