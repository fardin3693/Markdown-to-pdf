"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ArrowRight, Download, RefreshCw, CheckCircle2, AlertCircle, Settings, Minimize2, Trash2, X, DownloadCloud } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';

type CompressionLevel = 'max' | 'standard' | 'low';

interface FileQueueItem {
    id: string;
    file: File;
    status: 'idle' | 'compressing' | 'done' | 'error';
    level: CompressionLevel;
    result?: {
        url: string;
        filename: string;
        originalSize: number;
        compressedSize: number;
    };
    error?: string;
}

export default function CompressPdfPage() {
    const [queue, setQueue] = useState<FileQueueItem[]>([]);
    const [isGlobalCompressing, setIsGlobalCompressing] = useState(false);

    const onDrop = (acceptedFiles: File[]) => {
        const newItems: FileQueueItem[] = acceptedFiles.map(file => ({
            id: uuidv4(),
            file,
            status: 'idle',
            level: 'standard'
        }));
        setQueue(prev => [...prev, ...newItems]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: true
    });

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const updateItem = (id: string, updates: Partial<FileQueueItem>) => {
        setQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeItem = (id: string) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const compressItem = async (item: FileQueueItem) => {
        updateItem(item.id, { status: 'compressing', error: undefined });

        const formData = new FormData();
        formData.append('files', item.file);
        formData.append('compressionLevel', item.level);

        try {
            const response = await fetch('/api/compress', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Compression failed');
            }

            // Get headers for size info
            const originalSizeFromHeader = response.headers.get('X-Original-Size');
            const compressedSizeFromHeader = response.headers.get('X-Compressed-Size');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            updateItem(item.id, {
                status: 'done',
                result: {
                    url,
                    filename: `compressed_${item.file.name}`,
                    originalSize: originalSizeFromHeader ? parseInt(originalSizeFromHeader) : item.file.size,
                    compressedSize: compressedSizeFromHeader ? parseInt(compressedSizeFromHeader) : blob.size
                }
            });

        } catch (err) {
            console.error(err);
            updateItem(item.id, { status: 'error', error: (err as Error).message });
        }
    };

    const handleCompressAll = async () => {
        setIsGlobalCompressing(true);
        const idleItems = queue.filter(item => item.status === 'idle' || item.status === 'error');

        // Process in parallel
        await Promise.all(idleItems.map(item => compressItem(item)));

        setIsGlobalCompressing(false);
    };

    const handleDownloadAll = async () => {
        const doneItems = queue.filter(item => item.status === 'done' && item.result);

        if (doneItems.length === 0) return;

        const zip = new JSZip();

        // Add all PDFs to the ZIP
        for (const item of doneItems) {
            if (item.result) {
                // Fetch the blob from the URL
                const response = await fetch(item.result.url);
                const blob = await response.blob();

                // Use a clean filename for the zip
                let fileName = item.result.filename;
                if (fileName.startsWith('compressed_')) {
                    // Remove 'compressed_' prefix to get the original name back, then add our suffix
                    const originalName = fileName.substring(11); // length of 'compressed_'
                    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
                    const ext = originalName.substring(originalName.lastIndexOf('.'));
                    fileName = `${nameWithoutExt}_compressed${ext}`;
                }

                zip.file(fileName, blob);
            }
        }

        // Generate the ZIP and trigger download
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);

        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_pdfs_${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const hasItems = queue.length > 0;
    const allDone = queue.length > 0 && queue.every(item => item.status === 'done');

    return (
        <div className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-xl mb-6">
                        <Minimize2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Compress PDF</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Reduce your PDF file size while maintaining quality.
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-8 ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-white'
                        } ${hasItems ? 'py-6 bg-white' : 'py-16 bg-white'}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className={` p-3 bg-blue-50 text-blue-600 rounded-xl ${hasItems ? 'w-10 h-10' : 'w-16 h-16'}`}>
                            <Upload className={hasItems ? 'w-5 h-5' : 'w-8 h-8'} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-slate-900 ${hasItems ? 'text-lg' : 'text-xl'}`}>
                                {hasItems ? 'Add more PDFs' : 'Drop your PDFs here'}
                            </h3>
                            {!hasItems && (
                                <p className="text-slate-500 mt-2">
                                    Process multiple files at once.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* File List */}
                {hasItems && (
                    <div className="space-y-4 mb-8">
                        {queue.map((item) => {
                            const reduction = item.result
                                ? Math.round(((item.result.originalSize - item.result.compressedSize) / item.result.originalSize) * 100)
                                : 0;

                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                                    {/* Top Section - File Info with Delete Button */}
                                    <div className="flex items-start justify-between w-full">
                                        {/* File Info */}
                                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">{item.file.name}</p>
                                                <p className="text-xs text-slate-500">{formatBytes(item.file.size)}</p>
                                            </div>
                                        </div>

                                        {/* Delete Button - Positioned at top right */}
                                        {item.status === 'idle' && (
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                                                title="Remove file"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Controls / Status - Position compression options below the delete button */}
                                    <div className="w-full flex justify-end">
                                        {item.status === 'idle' && (
                                            <div className="w-full md:w-auto">
                                                <select
                                                    value={item.level}
                                                    onChange={(e) => updateItem(item.id, { level: e.target.value as CompressionLevel })}
                                                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    disabled={isGlobalCompressing}
                                                >
                                                    <option value="max">Max Compression (Low Quality)</option>
                                                    <option value="standard">Standard (Recommended)</option>
                                                    <option value="low">Low Compression (High Quality)</option>
                                                </select>
                                            </div>
                                        )}

                                        {item.status === 'compressing' && (
                                            <div className="flex items-center text-blue-600 font-medium px-4">
                                                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                                Compressing...
                                            </div>
                                        )}

                                        {item.status === 'error' && (
                                            <div className="flex items-center text-red-600 text-sm bg-red-50 px-3 py-1.5 rounded-lg max-w-[200px] ml-auto">
                                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{item.error}</span>
                                                <button onClick={() => updateItem(item.id, { status: 'idle' })} className="ml-2 hover:bg-red-100 p-1 rounded">
                                                    <RefreshCw className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {item.status === 'done' && item.result && (
                                            <div className="flex items-center gap-3 ml-auto">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-600">
                                                        {formatBytes(item.result.compressedSize)}
                                                    </p>
                                                    <p className="text-xs text-slate-400 line-through">
                                                        {formatBytes(item.result.originalSize)}
                                                    </p>
                                                    {reduction > 0 && <span className="text-xs font-bold text-green-600">-{reduction}%</span>}
                                                </div>
                                                <a
                                                    href={item.result.url}
                                                    download={item.result.filename}
                                                    className="flex items-center px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Global Actions */}
                {hasItems && !allDone && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleCompressAll}
                            disabled={isGlobalCompressing}
                            className="bg-primary text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                            {isGlobalCompressing ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                                    Processing Files...
                                </>
                            ) : (
                                <>
                                    Compress All PDFs
                                    <ArrowRight className="w-6 h-6 ml-3" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {allDone && (
                    <div className="flex justify-center pt-8 gap-4">
                        <button
                            onClick={handleDownloadAll}
                            className="text-white font-semibold hover:text-white flex items-center bg-green-600 px-6 py-3 rounded-xl border border-green-700 shadow-sm hover:bg-green-700 transition-colors"
                        >
                            <DownloadCloud className="w-5 h-5 mr-2" />
                            Download All
                        </button>
                        <button
                            onClick={() => setQueue([])}
                            className="text-slate-500 font-semibold hover:text-slate-700 flex items-center bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
