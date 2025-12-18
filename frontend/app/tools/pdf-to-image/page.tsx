"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ArrowRight, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function PdfToImagePage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setDownloadUrl(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/tools/pdf-to-image/convert', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (error) {
            console.error(error);
            alert('Failed to convert PDF to images');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-xl mb-6">
                        <ImageIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">PDF to Image</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Convert PDF pages to high-quality images.
                    </p>
                </div>

                {/* Upload Area */}
                {!downloadUrl && (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-8 ${isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-300 hover:border-blue-400 hover:bg-white'
                            } ${file ? 'py-6 bg-white' : 'py-16 bg-white'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className={` p-3 bg-blue-50 text-blue-600 rounded-xl ${file ? 'w-10 h-10' : 'w-16 h-16'}`}>
                                <Upload className={file ? 'w-5 h-5' : 'w-8 h-8'} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-slate-900 ${file ? 'text-lg' : 'text-xl'}`}>
                                    {file ? 'Change PDF' : 'Drop your PDF here'}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Info */}
                {file && !downloadUrl && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between mb-8 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                {file && !downloadUrl && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleConvert}
                            disabled={isConverting}
                            className="bg-primary text-white text-lg font-bold px-10 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center disabled:opacity-70"
                        >
                            {isConverting ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Convert to Images
                                    <ArrowRight className="w-6 h-6 ml-3" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Result */}
                {downloadUrl && (
                    <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversion Complete!</h2>
                        <div className="flex justify-center gap-4 mt-8">
                            <a
                                href={downloadUrl}
                                download="converted_images.zip"
                                className="flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download ZIP
                            </a>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setDownloadUrl(null);
                                }}
                                className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Start Over
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
