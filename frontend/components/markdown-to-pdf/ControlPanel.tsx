'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, FileCode, Loader2, Download } from 'lucide-react';

interface ControlPanelProps {
    onConvert: () => void;
    onClear: () => void;
    onLoadSample: () => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isConverting: boolean;
    wordCount: number;
    charCount: number;
}

export default function ControlPanel({
    onConvert,
    onClear,
    onLoadSample,
    onFileUpload,
    isConverting,
    wordCount,
    charCount,
}: ControlPanelProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    onClick={onConvert}
                    disabled={isConverting}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-sm font-bold px-8 uppercase tracking-wide text-xs h-10"
                >
                    {isConverting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Wait...
                        </>
                    ) : (
                        <>
                            Convert to PDF
                        </>
                    )}
                </Button>

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-slate-300 text-slate-600 hover:bg-slate-50 uppercase tracking-wide text-xs h-10 font-bold"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown"
                    onChange={onFileUpload}
                    className="hidden"
                />

                <Button
                    onClick={onClear}
                    variant="ghost"
                    className="text-slate-400 hover:text-red-500 uppercase tracking-wide text-xs h-10 font-bold"
                >
                    Clear
                </Button>
            </div>

            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                {wordCount} Words / {charCount} Chars
            </div>
        </div>
    );
}
