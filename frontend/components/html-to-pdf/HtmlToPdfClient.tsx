'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import ToolPageHeader from '@/components/layout/ToolPageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Upload, FileCode2, Download, Loader2, Settings2, Sparkles, Monitor, Tablet, Smartphone, FileUp } from 'lucide-react';

type SourceMode = 'url' | 'html';
type UploadType = 'html' | 'zip' | null;

type HtmlToPdfOptions = {
    viewportPreset: 'desktop' | 'tablet' | 'mobile' | 'custom';
    viewportWidth: number;
    viewportHeight: number;
    pageSize: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'custom';
    pageWidth: string;
    pageHeight: string;
    orientation: 'portrait' | 'landscape';
    marginPreset: 'normal' | 'narrow' | 'wide' | 'none' | 'custom';
    margins: {
        top: string;
        right: string;
        bottom: string;
        left: string;
    };
    printBackground: boolean;
    singleLongPage: boolean;
};

const SAMPLE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        margin: 40px;
        background: linear-gradient(135deg, #eff6ff 0%, #ffffff 60%);
        color: #0f172a;
      }
      .hero {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
      }
      h1 {
        margin-top: 0;
      }
      .badge {
        display: inline-block;
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="hero">
      <span class="badge">Rendered Preview</span>
      <h1>HTML to PDF</h1>
      <p>This content is rendered like a webpage before PDF export.</p>
    </div>
  </body>
</html>`;

const initialOptions: HtmlToPdfOptions = {
    viewportPreset: 'desktop',
    viewportWidth: 1366,
    viewportHeight: 768,
    pageSize: 'A4',
    pageWidth: '210mm',
    pageHeight: '297mm',
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
    },
    printBackground: true,
    singleLongPage: false,
};

export default function HtmlToPdfClient() {
    const [sourceMode, setSourceMode] = useState<SourceMode>('url');
    const [url, setUrl] = useState('https://example.com');
    const [html, setHtml] = useState(SAMPLE_HTML);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<UploadType>(null);
    const [previewHtml, setPreviewHtml] = useState(SAMPLE_HTML);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [options, setOptions] = useState<HtmlToPdfOptions>(initialOptions);

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    useEffect(() => {
        if (sourceMode === 'html' && !uploadedFile) {
            setPreviewHtml(html);
        }
    }, [sourceMode, html, uploadedFile]);

    const selectedViewportLabel = useMemo(() => {
        if (options.viewportPreset === 'desktop') return 'Desktop';
        if (options.viewportPreset === 'tablet') return 'Tablet';
        if (options.viewportPreset === 'mobile') return 'Mobile';
        return `${options.viewportWidth}x${options.viewportHeight}`;
    }, [options.viewportPreset, options.viewportWidth, options.viewportHeight]);

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setUploadedFile(file);
        setErrorMessage('');

        if (!file) {
            setUploadType(null);
            setPreviewHtml(html);
            return;
        }

        const lowerName = file.name.toLowerCase();
        const isHtml = lowerName.endsWith('.html') || lowerName.endsWith('.htm');
        const isZip = lowerName.endsWith('.zip');

        if (!isHtml && !isZip) {
            setUploadedFile(null);
            setUploadType(null);
            setErrorMessage('Please upload an .html, .htm, or .zip file.');
            return;
        }

        if (isZip) {
            setUploadType('zip');
            setPreviewHtml('<p style="font-family: sans-serif; color: #334155;">ZIP preview is not available. Export to render zipped assets on the server.</p>');
            return;
        }

        setUploadType('html');
        const reader = new FileReader();
        reader.onload = () => {
            const content = typeof reader.result === 'string' ? reader.result : '';
            setPreviewHtml(content || '<p>Unable to preview this file.</p>');
        };
        reader.onerror = () => {
            setPreviewHtml('<p>Unable to preview this file.</p>');
        };
        reader.readAsText(file);
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        if (downloadUrl) {
            window.URL.revokeObjectURL(downloadUrl);
        }

        const objectUrl = window.URL.createObjectURL(blob);
        setDownloadUrl(objectUrl);

        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const handleConvert = async () => {
        setErrorMessage('');
        setIsConverting(true);

        try {
            const endpoint = '/api/tools/html-to-pdf/convert';
            const optionsPayload = JSON.stringify(options);

            let response: Response;

            if (sourceMode === 'url') {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'url', url, options }),
                });
            } else if (uploadedFile) {
                const formData = new FormData();
                formData.append('mode', 'upload');
                formData.append('options', optionsPayload);
                formData.append('file', uploadedFile);

                response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData,
                });
            } else {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: 'html', html, options }),
                });
            }

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.details || payload.error || 'Failed to convert HTML to PDF.');
            }

            const pdfBlob = await response.blob();
            triggerDownload(pdfBlob, sourceMode === 'url' ? 'website.pdf' : 'html-render.pdf');
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unexpected error while converting HTML to PDF.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <>
            <ToolPageHeader title="HTML to PDF" />
            <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#ffffff_100%)]" />

                <main className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
                    <section className="rounded-3xl border border-sky-100/80 bg-white/90 p-6 shadow-[0_16px_48px_-28px_rgba(15,23,42,0.35)] backdrop-blur md:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Browser Render Engine
                                </div>
                                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                                    HTML to PDF with Real Web Rendering
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                                    Convert a website URL, pasted HTML, or an uploaded HTML bundle into PDF exactly as a browser renders it.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSourceMode('url');
                                        setErrorMessage('');
                                    }}
                                    className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${sourceMode === 'url'
                                        ? 'border-blue-400 bg-blue-50 text-blue-800 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                                        }`}
                                >
                                    <Globe className="h-5 w-5" />
                                    <span className="text-sm font-semibold">From Website URL</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSourceMode('html');
                                        setErrorMessage('');
                                    }}
                                    className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${sourceMode === 'html'
                                        ? 'border-sky-400 bg-sky-50 text-sky-800 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700'
                                        }`}
                                >
                                    <FileCode2 className="h-5 w-5" />
                                    <span className="text-sm font-semibold">Paste HTML or Upload File</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Input Source</h2>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {sourceMode === 'url' ? 'URL Mode' : 'HTML Mode'}
                                </span>
                            </div>

                            {sourceMode === 'url' ? (
                                <div className="mt-5 space-y-3">
                                    <label htmlFor="website-url" className="text-sm font-semibold text-slate-700">Website URL</label>
                                    <Input
                                        id="website-url"
                                        value={url}
                                        onChange={(event) => setUrl(event.target.value)}
                                        placeholder="https://example.com"
                                        className="h-11 rounded-xl border-slate-300 bg-white text-slate-800"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Public <span className="font-semibold">http/https</span> URLs only.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label htmlFor="html-content" className="text-sm font-semibold text-slate-700">Paste HTML</label>
                                        <textarea
                                            id="html-content"
                                            value={html}
                                            onChange={(event) => {
                                                setHtml(event.target.value);
                                                setUploadedFile(null);
                                                setUploadType(null);
                                            }}
                                            className="mt-2 min-h-[220px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            placeholder="Paste full HTML document here..."
                                        />
                                    </div>

                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                                        <label htmlFor="html-upload" className="mb-2 block text-sm font-semibold text-slate-700">Upload .html/.htm or .zip</label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <label htmlFor="html-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                                                <Upload className="h-4 w-4" />
                                                Choose File
                                            </label>
                                            <input id="html-upload" type="file" accept=".html,.htm,.zip" className="hidden" onChange={handleFileUpload} />
                                            <span className="truncate text-sm text-slate-600">
                                                {uploadedFile ? uploadedFile.name : 'No file selected'}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs text-slate-500">ZIP supports bundled CSS, JS, and images.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900">Rendering Controls</h2>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                                    onClick={() => setShowAdvanced((prev) => !prev)}
                                >
                                    <Settings2 className="h-3.5 w-3.5" />
                                    {showAdvanced ? 'Hide Options' : 'Show Options'}
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                                {[
                                    { key: 'desktop', label: 'Desktop', icon: Monitor },
                                    { key: 'tablet', label: 'Tablet', icon: Tablet },
                                    { key: 'mobile', label: 'Mobile', icon: Smartphone },
                                ].map((preset) => (
                                    <button
                                        type="button"
                                        key={preset.key}
                                        onClick={() => setOptions((prev) => ({ ...prev, viewportPreset: preset.key as HtmlToPdfOptions['viewportPreset'] }))}
                                        className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold transition ${options.viewportPreset === preset.key
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-slate-600 hover:text-blue-700'
                                            }`}
                                    >
                                        <preset.icon className="h-3.5 w-3.5" />
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {showAdvanced && (
                                <div className="mt-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="viewport-width" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Viewport Width</label>
                                            <Input
                                                id="viewport-width"
                                                type="number"
                                                min={320}
                                                max={2560}
                                                value={options.viewportWidth}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, viewportPreset: 'custom', viewportWidth: Number(event.target.value) || 1366 }))}
                                                className="mt-1 h-10 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="viewport-height" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Viewport Height</label>
                                            <Input
                                                id="viewport-height"
                                                type="number"
                                                min={320}
                                                max={2560}
                                                value={options.viewportHeight}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, viewportPreset: 'custom', viewportHeight: Number(event.target.value) || 768 }))}
                                                className="mt-1 h-10 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="page-size" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Page Size</label>
                                            <select
                                                id="page-size"
                                                value={options.pageSize}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, pageSize: event.target.value as HtmlToPdfOptions['pageSize'] }))}
                                                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            >
                                                {['A4', 'Letter', 'Legal', 'A3', 'A5', 'custom'].map((size) => <option key={size} value={size}>{size}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="orientation" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Orientation</label>
                                            <select
                                                id="orientation"
                                                value={options.orientation}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, orientation: event.target.value as HtmlToPdfOptions['orientation'] }))}
                                                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="portrait">Portrait</option>
                                                <option value="landscape">Landscape</option>
                                            </select>
                                        </div>
                                    </div>

                                    {options.pageSize === 'custom' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label htmlFor="page-width" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Custom Width</label>
                                                <Input
                                                    id="page-width"
                                                    value={options.pageWidth}
                                                    onChange={(event) => setOptions((prev) => ({ ...prev, pageWidth: event.target.value }))}
                                                    className="mt-1 h-10 rounded-lg"
                                                    placeholder="210mm"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="page-height" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Custom Height</label>
                                                <Input
                                                    id="page-height"
                                                    value={options.pageHeight}
                                                    onChange={(event) => setOptions((prev) => ({ ...prev, pageHeight: event.target.value }))}
                                                    className="mt-1 h-10 rounded-lg"
                                                    placeholder="297mm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="margin-preset" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Margins</label>
                                        <select
                                            id="margin-preset"
                                            value={options.marginPreset}
                                            onChange={(event) => setOptions((prev) => ({ ...prev, marginPreset: event.target.value as HtmlToPdfOptions['marginPreset'] }))}
                                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="narrow">Narrow</option>
                                            <option value="wide">Wide</option>
                                            <option value="none">None</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                    </div>

                                    {options.marginPreset === 'custom' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                                                <div key={side}>
                                                    <label htmlFor={`margin-${side}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{side}</label>
                                                    <Input
                                                        id={`margin-${side}`}
                                                        value={options.margins[side]}
                                                        onChange={(event) => setOptions((prev) => ({
                                                            ...prev,
                                                            margins: {
                                                                ...prev.margins,
                                                                [side]: event.target.value,
                                                            },
                                                        }))}
                                                        className="mt-1 h-10 rounded-lg"
                                                        placeholder="15mm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={options.printBackground}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, printBackground: event.target.checked }))}
                                            />
                                            Print backgrounds
                                        </label>

                                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={options.singleLongPage}
                                                onChange={(event) => setOptions((prev) => ({ ...prev, singleLongPage: event.target.checked }))}
                                            />
                                            One long PDF page
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900">
                                <p className="font-semibold">Current preset</p>
                                <p className="mt-1">Viewport: {selectedViewportLabel} • Page: {options.pageSize} • {options.orientation}</p>
                            </div>

                            <Button
                                onClick={handleConvert}
                                disabled={isConverting || (sourceMode === 'url' && !url.trim()) || (sourceMode === 'html' && !uploadedFile && !html.trim())}
                                className="mt-6 h-11 w-full rounded-xl"
                            >
                                {isConverting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Rendering PDF...
                                    </>
                                ) : (
                                    <>
                                        <FileUp className="h-4 w-4" />
                                        Render and Download PDF
                                    </>
                                )}
                            </Button>

                            {downloadUrl && !isConverting && (
                                <a
                                    href={downloadUrl}
                                    download="rendered.pdf"
                                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Again
                                </a>
                            )}

                            {errorMessage && (
                                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                        <h2 className="text-lg font-bold text-slate-900">Rendered Preview</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            This preview shows rendered output for pasted HTML and HTML files. ZIP previews are generated on export.
                        </p>

                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <iframe
                                title="HTML preview"
                                srcDoc={sourceMode === 'html' ? previewHtml : `<html><body style=\"font-family:Segoe UI,sans-serif;padding:24px;color:#334155;\"><h2>URL Mode</h2><p>The website URL is rendered on the server at export time.</p></body></html>`}
                                className="h-[460px] w-full"
                                sandbox="allow-scripts allow-forms allow-modals"
                            />
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
