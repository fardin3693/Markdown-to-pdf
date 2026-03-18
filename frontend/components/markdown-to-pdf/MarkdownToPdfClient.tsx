'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import MarkdownEditor, { MarkdownEditorRef } from '@/components/markdown-to-pdf/MarkdownEditor';
import MarkdownPreview, { MarkdownPreviewRef } from '@/components/markdown-to-pdf/MarkdownPreview';
import EditorToolbar from '@/components/markdown-to-pdf/EditorToolbar';
import ExportPanel from '@/components/markdown-to-pdf/ExportPanel';
import PDFOptionsModal from '@/components/markdown-to-pdf/PDFOptionsModal';
import FindReplaceBar from '@/components/markdown-to-pdf/FindReplaceBar';
import { Button } from '@/components/ui/button';
import UploadProgressCard from '@/components/upload/UploadProgressCard';
import { uploadBlobWithProgress, isUploadAbortError, type TransferPhase, type UploadBlobWithProgressRequest } from '@/lib/upload';
import { PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Upload, GripVertical } from 'lucide-react';

const SAMPLE_MARKDOWN = `# Markdown to PDF

Simple, clean, and free markdown converter with **LaTeX** support!

## Key Features

- **Instant Conversion**: Get PDFs in seconds.
- **LaTeX Support**: Render mathematical formulas.
- **Clean Output**: Professional formatting.

### Code Snippet

\`\`\`javascript
console.log("Hello, PDF!");
\`\`\`

### Math Examples

Inline math: $E = mc^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

> "Simplicity is the ultimate sophistication."
`;

export default function MarkdownToPdfClient() {
    // Core state
    const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [conversionProgress, setConversionProgress] = useState<number>(0);
    const [conversionPhase, setConversionPhase] = useState<TransferPhase>('idle');
    const [conversionError, setConversionError] = useState<string | undefined>(undefined);
    const [activeExportLabel, setActiveExportLabel] = useState<'pdf' | 'html' | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Panel visibility state - separate for each panel
    const [showEditor, setShowEditor] = useState<boolean>(true);
    const [showPreview, setShowPreview] = useState<boolean>(true);

    // Panel width state (percentage)
    const [editorWidth, setEditorWidth] = useState<number>(50);

    // Undo/Redo state
    const [history, setHistory] = useState<string[]>([SAMPLE_MARKDOWN]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    // Find/Replace state
    const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [replaceTerm, setReplaceTerm] = useState<string>('');
    const [matchCount, setMatchCount] = useState<number>(0);
    const [currentMatch, setCurrentMatch] = useState<number>(0);
    const [matchPositions, setMatchPositions] = useState<number[]>([]);
    const [shouldFocusMatch, setShouldFocusMatch] = useState<boolean>(false);

    // PDF Options state
    const [showPDFOptions, setShowPDFOptions] = useState<boolean>(false);
    const [pdfOptions, setPdfOptions] = useState<{
        fontFamily: string;
        fontSize: string;
        pageSize: string;
        margins: string | { top: string; right: string; bottom: string; left: string };
    }>({
        fontFamily: 'Arial',
        fontSize: '12pt',
        pageSize: 'A4',
        margins: 'normal',
    });

    const editorRef = useRef<MarkdownEditorRef>(null);
    const previewRef = useRef<MarkdownPreviewRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);
    const activeRequestRef = useRef<UploadBlobWithProgressRequest | null>(null);
    const resetExportStatusTimeoutRef = useRef<number | null>(null);

    // Scroll sync handler
    const handleEditorScroll = useCallback((scrollPercentage: number) => {
        if (previewRef.current && showPreview) {
            previewRef.current.scrollToPercentage(scrollPercentage);
        }
    }, [showPreview]);

    // Update match count and positions when search term changes
    useEffect(() => {
        if (searchTerm) {
            const positions: number[] = [];
            let match;
            const regex = new RegExp(searchTerm, 'gi');
            while ((match = regex.exec(markdown)) !== null) {
                positions.push(match.index);
            }
            setMatchPositions(positions);
            setMatchCount(positions.length);
            setCurrentMatch(positions.length > 0 ? 1 : 0);
            setShouldFocusMatch(false); // Don't steal focus while typing
        } else {
            setMatchPositions([]);
            setMatchCount(0);
            setCurrentMatch(0);
        }
    }, [searchTerm, markdown]);

    // Handle markdown change with history
    const handleMarkdownChange = useCallback(
        (newValue: string) => {
            setMarkdown(newValue);
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newValue);
            if (newHistory.length > 50) newHistory.shift();
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex]
    );

    // Undo
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setMarkdown(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    // Redo
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setMarkdown(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // Format handler
    const handleFormat = useCallback(
        (format: string, wrapper?: { before: string; after: string }) => {
            if (wrapper && editorRef.current) {
                editorRef.current.insertFormat(wrapper.before, wrapper.after);
            }
        },
        []
    );

    // Find handlers with actual navigation
    const handleFindNext = () => {
        if (matchCount > 0) {
            setShouldFocusMatch(true);
            setCurrentMatch((prev) => (prev < matchCount ? prev + 1 : 1));
        }
    };

    const handleFindPrev = () => {
        if (matchCount > 0) {
            setShouldFocusMatch(true);
            setCurrentMatch((prev) => (prev > 1 ? prev - 1 : matchCount));
        }
    };

    const handleReplace = useCallback(() => {
        if (searchTerm && matchPositions.length > 0 && currentMatch > 0) {
            const pos = matchPositions[currentMatch - 1];
            const newText =
                markdown.substring(0, pos) +
                replaceTerm +
                markdown.substring(pos + searchTerm.length);
            handleMarkdownChange(newText);
        }
    }, [searchTerm, replaceTerm, markdown, matchPositions, currentMatch, handleMarkdownChange]);

    const handleReplaceAll = useCallback(() => {
        if (searchTerm && matchCount > 0) {
            const regex = new RegExp(searchTerm, 'gi');
            handleMarkdownChange(markdown.replace(regex, replaceTerm));
        }
    }, [searchTerm, replaceTerm, markdown, matchCount, handleMarkdownChange]);

    // Export handlers
    const buildMarkdownPayload = useCallback((format?: 'html') => JSON.stringify({
        markdown,
        ...(format ? { format } : {}),
        ...(!format ? { options: pdfOptions } : {}),
    }), [markdown, pdfOptions]);

    const cancelActiveExport = useCallback(() => {
        activeRequestRef.current?.abort();
    }, []);

    const runExport = useCallback(async (type: 'pdf' | 'html') => {
        setIsConverting(true);
        if (resetExportStatusTimeoutRef.current) {
            window.clearTimeout(resetExportStatusTimeoutRef.current);
            resetExportStatusTimeoutRef.current = null;
        }
        setConversionProgress(0);
        setConversionPhase('uploading');
        setConversionError(undefined);
        setActiveExportLabel(type);

        try {
            const request = uploadBlobWithProgress({
                url: '/api/convert',
                body: buildMarkdownPayload(type === 'html' ? 'html' : undefined),
                headers: {
                    'Content-Type': 'application/json',
                },
                onProgress: setConversionProgress,
                onPhaseChange: (phase) => setConversionPhase(phase === 'done' ? 'processing' : phase),
            });
            activeRequestRef.current = request;

            const { blob } = await request;
            const fileName = type === 'html' ? 'document.html' : 'document.pdf';
            const mimeType = type === 'html' ? 'text/html' : 'application/pdf';
            const outputBlob = new Blob([blob], { type: mimeType });
            const url = window.URL.createObjectURL(outputBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setConversionProgress(100);
            setConversionPhase('done');
        } catch (error) {
            console.error(`Error exporting ${type.toUpperCase()}:`, error);
            if (isUploadAbortError(error)) {
                setConversionPhase('cancelled');
                return;
            }

            const message = error instanceof Error ? error.message : 'Conversion failed';
            setConversionPhase('error');
            setConversionError(message);
        } finally {
            activeRequestRef.current = null;
            setIsConverting(false);
            resetExportStatusTimeoutRef.current = window.setTimeout(() => {
                setActiveExportLabel(null);
                setConversionError(undefined);
                setConversionProgress(0);
                setConversionPhase('idle');
                resetExportStatusTimeoutRef.current = null;
            }, 2000);
        }
    }, [buildMarkdownPayload]);

    const handleExportHTML = useCallback(async () => {
        await runExport('html');
    }, [runExport]);

    const handleExportPDF = useCallback(async () => {
        await runExport('pdf');
    }, [runExport]);

    const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

    const processFile = (file: File) => {
        if (!file.name.match(/\.(md|markdown|txt)$/i)) {
            alert('Please upload a Markdown (.md, .markdown) or Text (.txt) file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => handleMarkdownChange(e.target?.result as string);
        reader.readAsText(file);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setIsDraggingFile(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [handleMarkdownChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'f') {
                    e.preventDefault();
                    setShowFindReplace(true);
                } else if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    handleRedo();
                }
            }
            if (e.key === 'Escape') {
                setShowFindReplace(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    useEffect(() => {
        return () => {
            activeRequestRef.current?.abort();
            if (resetExportStatusTimeoutRef.current) {
                window.clearTimeout(resetExportStatusTimeoutRef.current);
            }
        };
    }, []);

    // Mouse drag resize handler
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = editorWidth;
        const container = resizeRef.current?.parentElement;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const containerWidth = container.clientWidth;
            const deltaX = e.clientX - startX;
            const newWidth = startWidth + (deltaX / containerWidth) * 100;
            setEditorWidth(Math.min(80, Math.max(20, newWidth)));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [editorWidth]);

    return (
        <div
            className={`flex flex-col bg-slate-50 ${isMobile ? 'min-h-[calc(100vh-64px)]' : 'h-[calc(100vh-64px)] overflow-hidden'} relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            {isDraggingFile && (
                <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-xl pointer-events-none">
                    <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
                        <Upload className="h-12 w-12 text-blue-500 mb-2" />
                        <h3 className="text-xl font-bold text-slate-800">Drop your file here</h3>
                        <p className="text-slate-500">Supports .md, .markdown, .txt</p>
                    </div>
                </div>
            )}

            {/* Secondary Toolbar (Editor Specific) */}
            <header className="flex-none border-b border-slate-200 bg-white" aria-label="Tool actions">
                <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Markdown to PDF</h1>

                    <div className="flex items-center gap-3">
                        {/* Upload Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-9 border-slate-300"
                        >
                            <Upload className="h-4 w-4 md:mr-1.5" />
                            <span className="hidden md:inline">Upload</span>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.markdown,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

                        {/* Toggle Editor */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditor(!showEditor)}
                            className="h-9 border-slate-300"
                            title={showEditor ? 'Hide Editor' : 'Show Editor'}
                        >
                            {showEditor ? (
                                <PanelLeftClose className="h-4 w-4" />
                            ) : (
                                <PanelLeft className="h-4 w-4" />
                            )}
                        </Button>

                        {/* Toggle Preview */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="h-9 border-slate-300"
                            title={showPreview ? 'Hide Preview' : 'Show Preview'}
                        >
                            {showPreview ? (
                                <PanelRightClose className="h-4 w-4" />
                            ) : (
                                <PanelRight className="h-4 w-4" />
                            )}
                        </Button>

                        {/* Export Panel */}
                        <ExportPanel
                            onExportHTML={handleExportHTML}
                            onExportPDF={handleExportPDF}
                            onOpenPDFOptions={() => setShowPDFOptions(true)}
                            isConverting={isConverting}
                            onCancel={cancelActiveExport}
                        />
                    </div>
                </div>
            </header>

            {(isConverting || conversionPhase === 'error' || conversionPhase === 'cancelled' || conversionPhase === 'done') && activeExportLabel ? (
                <div className="border-b border-slate-200 bg-white/90 px-4 py-3">
                    <div className="mx-auto max-w-screen-2xl">
                        <UploadProgressCard
                            className="border-slate-200 shadow-sm shadow-slate-200/60"
                            fileName={activeExportLabel === 'pdf' ? 'Markdown document.pdf' : 'Markdown document.html'}
                            fileSizeLabel={`${markdown.length.toLocaleString()} characters of source content`}
                            progress={conversionProgress}
                            phase={conversionPhase}
                            error={conversionError}
                            canCancel={isConverting}
                            onCancel={cancelActiveExport}
                        />
                    </div>
                </div>
            ) : null}

            {/* Toolbar */}
            <div className="flex-none">
                <EditorToolbar
                    onFormat={handleFormat}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onToggleFind={() => setShowFindReplace(!showFindReplace)}
                />
            </div>

            {/* Main Content - Fixed Height */}
            <main className={`flex-1 flex ${isMobile ? 'flex-col' : 'flex-row overflow-hidden'}`}>
                {/* Editor Panel */}
                {showEditor && (
                    <section
                        aria-label="Markdown Input"
                        className="flex flex-col bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden"
                        style={{
                            width: isMobile ? '100%' : (showPreview ? editorWidth + '%' : '100%'),
                            height: isMobile ? '60vh' : undefined,
                            flex: isMobile ? 'none' : undefined
                        }}
                    >
                        {/* Find Replace Bar */}
                        {showFindReplace && (
                            <div className="flex-none border-b border-slate-200">
                                <FindReplaceBar
                                    isOpen={true}
                                    onClose={() => setShowFindReplace(false)}
                                    searchTerm={searchTerm}
                                    replaceTerm={replaceTerm}
                                    onSearchChange={setSearchTerm}
                                    onReplaceChange={setReplaceTerm}
                                    onFindNext={handleFindNext}
                                    onFindPrev={handleFindPrev}
                                    onReplace={handleReplace}
                                    onReplaceAll={handleReplaceAll}
                                    matchCount={matchCount}
                                    currentMatch={currentMatch}
                                />
                            </div>
                        )}
                        {/* Editor */}
                        <div className="flex-1 overflow-hidden">
                            <MarkdownEditor
                                ref={editorRef}
                                value={markdown}
                                onChange={handleMarkdownChange}
                                onScrollChange={handleEditorScroll}
                                searchTerm={searchTerm}
                                matchPositions={matchPositions}
                                currentMatch={currentMatch}
                                shouldFocusMatch={shouldFocusMatch}
                            />
                        </div>
                    </section>
                )}

                {/* Resize Handle (Desktop Only) */}
                {showEditor && showPreview && !isMobile && (
                    <div
                        ref={resizeRef}
                        className="flex-none w-1 bg-slate-200 hover:bg-slate-400 cursor-col-resize flex items-center justify-center transition-colors"
                        onMouseDown={handleMouseDown}
                    >
                        <GripVertical className="h-4 w-4 text-slate-400" />
                    </div>
                )}

                {/* Preview Panel */}
                {showPreview && (
                    <section
                        aria-label="PDF Preview"
                        className="flex-1 overflow-hidden bg-white"
                        style={{
                            width: isMobile ? '100%' : (showEditor ? (100 - editorWidth) + '%' : '100%'),
                            height: isMobile ? '60vh' : undefined,
                            flex: isMobile ? 'none' : undefined
                        }}
                    >
                        <MarkdownPreview ref={previewRef} content={markdown} options={pdfOptions} />
                    </section>
                )}

                {/* Empty state when both hidden */}
                {!showEditor && !showPreview && (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p>Use the panel buttons in the header to show Editor or Preview</p>
                    </div>
                )}
            </main>

            {/* Status Bar */}
            <footer className="flex-none h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                    {markdown.split(/\s+/).filter(Boolean).length} words •{' '}
                    {markdown.length} characters
                </span>
                <span>
                    Page: {pdfOptions.pageSize} • Font: {pdfOptions.fontFamily}
                </span>
            </footer>

            {/* PDF Options Modal */}
            <PDFOptionsModal
                isOpen={showPDFOptions}
                onClose={() => setShowPDFOptions(false)}
                options={pdfOptions}
                onOptionsChange={setPdfOptions}
            />
        </div>
    );
}
