'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import MarkdownEditor, { MarkdownEditorRef } from '@/components/MarkdownEditor';
import MarkdownPreview, { MarkdownPreviewRef } from '@/components/MarkdownPreview';
import EditorToolbar from '@/components/EditorToolbar';
import ExportPanel from '@/components/ExportPanel';
import PDFOptionsModal from '@/components/PDFOptionsModal';
import FindReplaceBar from '@/components/FindReplaceBar';
import { Button } from '@/components/ui/button';
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

export default function Home() {
    // Core state
    const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
    const [isConverting, setIsConverting] = useState<boolean>(false);
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
    const handleExportHTML = useCallback(async () => {
        setIsConverting(true);
        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown, format: 'html' }),
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document.html';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting HTML:', error);
            alert('Frontend not ready yet! HTML export requires the backend server.');
        } finally {
            setIsConverting(false);
        }
    }, [markdown]);

    const handleExportPDF = useCallback(async () => {
        setIsConverting(true);
        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown, options: pdfOptions }),
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error converting to PDF:', error);
            alert('Backend not ready yet! PDF conversion requires the backend server.');
        } finally {
            setIsConverting(false);
        }
    }, [markdown, pdfOptions]);

    const handlePrint = useCallback(async () => {
        setIsConverting(true);
        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markdown, format: 'html', options: pdfOptions }),
            });

            if (!response.ok) throw new Error('Conversion failed');

            const htmlContent = await response.text();

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.write('<script>window.onload = () => { window.print(); }</script>');
                printWindow.document.close();
            }
        } catch (error) {
            console.error('Error generating print preview:', error);
            alert('Backend connection failed! Print preview requires the backend server.');
        } finally {
            setIsConverting(false);
        }
    }, [markdown, pdfOptions]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => handleMarkdownChange(e.target?.result as string);
            reader.readAsText(file);
        }
    };

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
        <div className={`flex flex-col bg-slate-50 ${isMobile ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
            {/* Navigation Bar */}
            <nav className="flex-none border-b border-slate-200 bg-white">
                <div className="max-w-screen-2xl mx-auto px-4 min-h-[3.5rem] py-2 flex flex-wrap gap-y-2 items-center justify-between">
                    <div className="flex items-center gap-2 mr-4">
                        <span className="text-2xl">📄</span>
                        <span className="font-bold text-lg text-slate-800 tracking-tight">
                            MarkDownToPDF
                        </span>
                    </div>

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
                            onPrint={handlePrint}
                            onOpenPDFOptions={() => setShowPDFOptions(true)}
                            isConverting={isConverting}
                        />
                    </div>
                </div>
            </nav>

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
                    <div
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
                    </div>
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
                    <div
                        className="flex-1 overflow-hidden bg-white"
                        style={{
                            width: isMobile ? '100%' : (showEditor ? (100 - editorWidth) + '%' : '100%'),
                            height: isMobile ? '60vh' : undefined,
                            flex: isMobile ? 'none' : undefined
                        }}
                    >
                        <MarkdownPreview ref={previewRef} content={markdown} options={pdfOptions} />
                    </div>
                )}

                {/* Empty state when both hidden */}
                {!showEditor && !showPreview && (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p>Use the panel buttons in the header to show Editor or Preview</p>
                    </div>
                )}
            </main>

            {/* Status Bar */}
            <div className="flex-none h-7 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
                <span>
                    {markdown.split(/\s+/).filter(Boolean).length} words •{' '}
                    {markdown.length} characters
                </span>
                <span>
                    Page: {pdfOptions.pageSize} • Font: {pdfOptions.fontFamily}
                </span>
            </div>

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
