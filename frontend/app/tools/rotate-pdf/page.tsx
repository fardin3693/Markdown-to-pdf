'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, FileText, RotateCw, RotateCcw, RefreshCw, X, Settings } from 'lucide-react';
import UploadProgressCard from '@/components/upload/UploadProgressCard';
import {
    readFileAsArrayBufferWithProgress,
    uploadBlobWithProgress,
    type TransferPhase,
    type UploadBlobWithProgressRequest,
} from '@/lib/upload';

const PdfPageThumbnail = dynamic(() => import('@/components/split-pdf/PdfPageThumbnail'), { ssr: false });

type RotateMode = 'pages' | 'all';

export default function RotatePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [mode, setMode] = useState<RotateMode>('pages');

    // Per-page rotations: 1-indexed page number -> absolute degrees (0/90/180/270)
    const [pageRotations, setPageRotations] = useState<Record<number, number>>({});

    // Whole-file mode: accumulated rotation preview
    const [allRotation, setAllRotation] = useState<number>(0);

    const [hoveredPage, setHoveredPage] = useState<number | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isDraggingOnWindow, setIsDraggingOnWindow] = useState(false);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [fileLoadProgress, setFileLoadProgress] = useState(0);
    const [fileLoadPhase, setFileLoadPhase] = useState<TransferPhase>('idle');
    const [preparingFileName, setPreparingFileName] = useState<string>('');
    const [actionUploadProgress, setActionUploadProgress] = useState(0);
    const [actionTransferPhase, setActionTransferPhase] = useState<TransferPhase>('idle');
    const [actionError, setActionError] = useState<string | undefined>(undefined);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeRequest, setActiveRequest] = useState<UploadBlobWithProgressRequest | null>(null);

    const beginProcessingAction = () => {
        setIsProcessing(true);
        setActionUploadProgress(0);
        setActionTransferPhase('uploading');
        setActionError(undefined);
    };

    const handleActionFailure = (error: unknown) => {
        console.error(error);
        const message = error instanceof Error ? error.message : 'Failed to rotate PDF.';
        if (message === 'Upload aborted.') {
            setActionTransferPhase('cancelled');
        } else {
            setActionTransferPhase('error');
            setActionError(message);
            alert(message);
        }
    };

    useEffect(() => {
        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) setIsDraggingOnWindow(true);
        };
        const handleWindowDragLeave = (e: DragEvent) => {
            if (e.relatedTarget === null) setIsDraggingOnWindow(false);
        };
        const handleWindowDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDraggingOnWindow(false);
            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const droppedFile = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf');
                if (droppedFile) handleFileSelect(droppedFile);
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
        setPreparingFileName(selectedFile.name);
        setFileLoadProgress(0);
        setFileLoadPhase('uploading');
        setFile(selectedFile);
        setIsLoadingPages(true);
        setPageRotations({});
        setAllRotation(0);
        try {
            const arrayBuffer = await readFileAsArrayBufferWithProgress(selectedFile, setFileLoadProgress);
            setFileLoadPhase('processing');
            const { pdfjs } = await import('react-pdf');
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setFileLoadProgress(100);
            setFileLoadPhase('done');
        } catch (error) {
            console.error('Error reading PDF:', error);
            setFileLoadPhase('error');
            alert('Failed to read PDF file.');
        } finally {
            setIsLoadingPages(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPdfDoc(null);
        setTotalPages(0);
        setPageRotations({});
        setAllRotation(0);
    };

    // Rotate a single page by delta (+90 or -90), keeping value in 0/90/180/270
    const rotatePage = useCallback((pageNum: number, delta: number) => {
        setPageRotations(prev => {
            const current = prev[pageNum] ?? 0;
            const next = ((current + delta) % 360 + 360) % 360;
            if (next === 0) {
                const updated = { ...prev };
                delete updated[pageNum];
                return updated;
            }
            return { ...prev, [pageNum]: next };
        });
    }, []);

    // Rotate all pages by delta (cumulative preview)
    const rotateAllDelta = useCallback((delta: number) => {
        setAllRotation(prev => ((prev + delta) % 360 + 360) % 360);
    }, []);

    const getPageDisplayRotation = (pageNum: number): number => {
        if (mode === 'pages') return pageRotations[pageNum] ?? 0;
        return allRotation;
    };

    const rotatedPageCount = Object.keys(pageRotations).length;

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleRotatePages = async () => {
        if (!file) return;
        if (rotatedPageCount === 0) {
            alert('No pages have been rotated. Hover over a page thumbnail and use the rotation buttons.');
            return;
        }
        beginProcessingAction();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rotations', JSON.stringify(
            Object.fromEntries(Object.entries(pageRotations).map(([k, v]) => [k, v]))
        ));
        try {
            const request = uploadBlobWithProgress({
                url: '/api/tools/rotate-pdf/rotate-pages',
                formData,
                onProgress: setActionUploadProgress,
                onPhaseChange: (phase) => setActionTransferPhase(phase === 'done' ? 'processing' : phase),
            });
            setActiveRequest(request);
            const { blob } = await request;
            downloadBlob(blob, 'rotated.pdf');
            setActionUploadProgress(100);
            setActionTransferPhase('done');
        } catch (error) {
            handleActionFailure(error);
        } finally {
            setActiveRequest(null);
            setIsProcessing(false);
        }
    };

    const handleRotateAll = async () => {
        if (!file) return;
        if (allRotation === 0) {
            alert('No rotation selected. Use the Rotate Left or Rotate Right buttons to choose a rotation.');
            return;
        }
        beginProcessingAction();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rotation', String(allRotation));
        try {
            const request = uploadBlobWithProgress({
                url: '/api/tools/rotate-pdf/rotate-all',
                formData,
                onProgress: setActionUploadProgress,
                onPhaseChange: (phase) => setActionTransferPhase(phase === 'done' ? 'processing' : phase),
            });
            setActiveRequest(request);
            const { blob } = await request;
            downloadBlob(blob, 'rotated.pdf');
            setActionUploadProgress(100);
            setActionTransferPhase('done');
        } catch (error) {
            handleActionFailure(error);
        } finally {
            setActiveRequest(null);
            setIsProcessing(false);
        }
    };

    const handleMainAction = () => {
        if (mode === 'pages') {
            handleRotatePages();
        } else {
            handleRotateAll();
        }
    };

    const getButtonText = () => {
        if (!file) return 'Rotate PDF';
        if (mode === 'pages') {
            return rotatedPageCount > 0
                ? `Apply Rotation to ${rotatedPageCount} Page${rotatedPageCount !== 1 ? 's' : ''}`
                : 'Apply Rotation';
        }
        return allRotation > 0 ? `Rotate All Pages ${allRotation}°` : 'Rotate All Pages';
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col relative">
            {/* Window drag overlay */}
            {isDraggingOnWindow && !file && (
                <div className="fixed inset-0 z-50 bg-violet-500/10 backdrop-blur-sm border-4 border-violet-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
                        <UploadCloud className="w-16 h-16 text-violet-500" />
                    </div>
                    <div className="absolute mt-32 text-2xl font-bold text-violet-600 bg-white/80 px-6 py-2 rounded-full">
                        Drop PDF anywhere
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">Rotate PDF</h1>
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
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 hidden sm:flex"
                            onClick={handleRemoveFile}
                        >
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
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Upload a PDF to Rotate</h2>
                                <p className="text-slate-500">Drag & drop or click to select a file</p>
                            </div>
                            <label className="w-full max-w-md px-4 cursor-pointer">
                                <div className="w-full h-40 sm:h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:bg-slate-50 hover:border-violet-400 transition-colors flex flex-col items-center justify-center group">
                                    <div className="bg-violet-50 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <UploadCloud className="w-8 h-8 text-violet-500" />
                                    </div>
                                    <p className="text-slate-600 font-medium">Drop PDF file here</p>
                                    <p className="text-slate-400 text-sm mt-1">or click to browse</p>
                                    <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileInput} />
                                </div>
                            </label>
                        </div>
                    ) : isLoadingPages ? (
                        <div className="h-full flex items-center justify-center px-4">
                            <UploadProgressCard
                                className="w-full max-w-xl"
                                fileName={preparingFileName || file.name}
                                fileSizeLabel={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                progress={fileLoadProgress}
                                phase={fileLoadPhase}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                            {pdfDoc && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                                const displayRotation = getPageDisplayRotation(pageNum);
                                const hasRotation = displayRotation !== 0;

                                return (
                                    <div
                                        key={pageNum}
                                        className="relative bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-md border-slate-200 hover:border-violet-300 group"
                                        onMouseEnter={() => setHoveredPage(pageNum)}
                                        onMouseLeave={() => setHoveredPage(null)}
                                    >
                                        {/* Thumbnail with CSS rotation preview */}
                                        <div
                                            className="aspect-[3/4] relative bg-slate-100"
                                            style={{
                                                transform: `rotate(${displayRotation}deg)`,
                                                transition: 'transform 0.2s ease',
                                            }}
                                        >
                                            <PdfPageThumbnail pdfDoc={pdfDoc} pageNum={pageNum} />
                                        </div>

                                        {/* Page number label */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center font-medium z-10">
                                            {pageNum}
                                        </div>

                                        {/* Rotation badge */}
                                        {hasRotation && (
                                            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-20 pointer-events-none">
                                                {displayRotation}°
                                            </div>
                                        )}

                                        {/* Per-page rotation buttons — only in "pages" mode, visible on hover */}
                                        {mode === 'pages' && (
                                            <>
                                                {/* Rotate CCW — top-left */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); rotatePage(pageNum, -90); }}
                                                    className="absolute top-1 left-1 z-20 w-7 h-7 rounded-full bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center hover:bg-violet-100 hover:border-violet-400 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Rotate counter-clockwise (−90°)"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                                                </button>
                                                {/* Rotate CW — top-right */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); rotatePage(pageNum, 90); }}
                                                    className="absolute top-1 right-1 z-20 w-7 h-7 rounded-full bg-white/90 border border-slate-300 shadow-sm flex items-center justify-center hover:bg-violet-100 hover:border-violet-400 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Rotate clockwise (+90°)"
                                                >
                                                    <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                                                </button>
                                            </>
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
                    <div className="lg:hidden flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 relative z-50">
                        <span className="font-semibold text-slate-700">Settings</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-slate-200 rounded-lg"
                            aria-label="Close settings"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-3 sm:p-4 border-b border-slate-200 relative z-50">
                        {file && isProcessing && (
                            <UploadProgressCard
                                className="mb-3"
                                fileName={file.name}
                                fileSizeLabel={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                progress={actionUploadProgress}
                                phase={actionTransferPhase}
                                error={actionError}
                                canCancel={isProcessing}
                                onCancel={() => activeRequest?.abort()}
                            />
                        )}

                        {/* Mode Selection */}
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setMode('pages')}
                                className={`flex-1 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                    mode === 'pages'
                                        ? 'border-violet-500 bg-violet-50'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <RotateCw className="w-4 h-4 mx-auto mb-1 text-violet-500" />
                                <p className="text-xs font-medium text-slate-700">Rotate Pages</p>
                            </button>
                            <button
                                onClick={() => setMode('all')}
                                className={`flex-1 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                    mode === 'all'
                                        ? 'border-violet-500 bg-violet-50'
                                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <RefreshCw className="w-4 h-4 mx-auto mb-1 text-violet-500" />
                                <p className="text-xs font-medium text-slate-700">Rotate PDF</p>
                            </button>
                        </div>

                        {/* Action Button */}
                        <Button
                            size="lg"
                            className="w-full font-bold shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700 text-white"
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
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    {getButtonText()}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Scrollable Settings Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 pb-20 lg:pb-4 scroll-smooth relative z-50">

                        {/* Rotate Pages Mode */}
                        {mode === 'pages' && (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Hover over any page thumbnail to reveal the rotation buttons.
                                    Use <span className="font-semibold text-violet-600">top-left</span> to rotate counter-clockwise,
                                    {' '}<span className="font-semibold text-violet-600">top-right</span> to rotate clockwise.
                                </p>

                                {rotatedPageCount > 0 ? (
                                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
                                        <p className="text-xs font-semibold text-violet-700">
                                            {rotatedPageCount} page{rotatedPageCount !== 1 ? 's' : ''} rotated
                                        </p>
                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {Object.entries(pageRotations)
                                                .sort(([a], [b]) => Number(a) - Number(b))
                                                .map(([pageNum, angle]) => (
                                                    <div key={pageNum} className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-600">Page {pageNum}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-mono font-bold">{angle}°</span>
                                                            <button
                                                                onClick={() => setPageRotations(prev => {
                                                                    const updated = { ...prev };
                                                                    delete updated[Number(pageNum)];
                                                                    return updated;
                                                                })}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Reset this page"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <button
                                            onClick={() => setPageRotations({})}
                                            className="text-xs text-red-500 hover:text-red-600 transition-colors mt-1"
                                        >
                                            Reset all rotations
                                        </button>
                                    </div>
                                ) : (
                                    file && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                                            <RotateCw className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                            <p className="text-xs text-slate-400">No pages rotated yet</p>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Rotate PDF (all pages) Mode */}
                        {mode === 'all' && (
                            <div className="space-y-3">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Choose a rotation direction. This will be applied to every page in the PDF.
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => rotateAllDelta(-90)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all group"
                                    >
                                        <RotateCcw className="w-6 h-6 text-slate-500 group-hover:text-violet-600 transition-colors" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-violet-700">Rotate Left</span>
                                        <span className="text-[10px] text-slate-400">−90°</span>
                                    </button>
                                    <button
                                        onClick={() => rotateAllDelta(90)}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all group"
                                    >
                                        <RotateCw className="w-6 h-6 text-slate-500 group-hover:text-violet-600 transition-colors" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-violet-700">Rotate Right</span>
                                        <span className="text-[10px] text-slate-400">+90°</span>
                                    </button>
                                </div>

                                <div className={`rounded-lg p-3 border ${allRotation > 0 ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-600">Current rotation</span>
                                        <span className={`text-sm font-bold font-mono ${allRotation > 0 ? 'text-violet-700' : 'text-slate-400'}`}>
                                            {allRotation}°
                                        </span>
                                    </div>
                                    {allRotation > 0 && (
                                        <button
                                            onClick={() => setAllRotation(0)}
                                            className="text-xs text-red-500 hover:text-red-600 transition-colors mt-2"
                                        >
                                            Reset to 0°
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-slate-400">
                                    Each click adds 90°. Click multiple times to reach 180° or 270°.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
