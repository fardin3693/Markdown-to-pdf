'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, FileText } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Check if window is defined to avoid SSR issues with worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

interface SortablePdfItemProps {
    id: string;
    file: File;
    onRemove: (id: string) => void;
}

export default function SortablePdfItem({ id, file, onRemove }: SortablePdfItemProps) {
    const [mounted, setMounted] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Create Object URL for the file
        const url = URL.createObjectURL(file);
        setPdfUrl(url);

        // Cleanup
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const loadingSkeleton = useMemo(() => (
        <div className="w-full h-full animate-pulse bg-slate-200" />
    ), []);

    const errorState = useMemo(() => (
        <FileText className="h-6 w-6 text-slate-400" />
    ), []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center group hover:shadow-md transition-shadow h-full min-h-[280px] cursor-grab active:cursor-grabbing touch-none"
        >
            {/* Action Buttons Container */}
            <div className="absolute top-2 right-2 z-10">
                {/* Remove Action */}
                <button
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking remove
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent bubble
                        onRemove(id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100"
                    title="Remove file"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="h-40 w-28 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-none relative items-center justify-center flex mb-4 shadow-sm select-none pointer-events-none">
                {mounted && pdfUrl && (
                    <Document
                        file={pdfUrl}
                        className="h-full w-full"
                        error={errorState}
                        loading={loadingSkeleton}
                    >
                        <Page
                            pageNumber={1}
                            height={160}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                )}
                {(!mounted || !pdfUrl) && (
                    <div className="w-full h-full animate-pulse bg-slate-200" />
                )}
            </div>

            {/* File Info */}
            <div className="w-full text-center px-2 select-none">
                <p className="text-sm font-medium text-slate-900 truncate w-full" title={file.name}>
                    {file.name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
            </div>
        </div>
    );
}
