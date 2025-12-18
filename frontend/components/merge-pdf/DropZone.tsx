'use client';

import React, { useRef } from 'react';
import { Upload, FileType } from 'lucide-react';

interface DropZoneProps {
    onFilesDrop: (files: File[]) => void;
}

export default function DropZone({ onFilesDrop }: DropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const isPdf = (file: File) => {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files).filter(isPdf);
        if (files.length > 0) {
            onFilesDrop(files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(isPdf);
            if (files.length > 0) {
                onFilesDrop(files);
            }
        }
        // Reset input value to allow selecting the same file again if needed
        if (e.target) {
            e.target.value = '';
        }
    }

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className="w-full max-w-2xl mx-auto h-64 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Drop PDF files here</h3>
            <p className="text-slate-500 text-sm mb-6">or click to browse your computer</p>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileInput}
            />
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileType className="w-4 h-4" />
                <span>Supports PDF only</span>
            </div>
        </div>
    );
}
