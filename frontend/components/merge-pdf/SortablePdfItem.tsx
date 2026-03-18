'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, FileText, CheckCircle2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';

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
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
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
        <div className="w-full h-full animate-pulse bg-slate-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-200" />
        </div>
    ), []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative bg-white p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center group cursor-grab active:cursor-grabbing touch-none ${
                isDragging 
                    ? "shadow-2xl border-blue-500 ring-4 ring-blue-500/10" 
                    : "border-slate-200 hover:border-blue-200 hover:shadow-xl shadow-sm"
            }`}
        >
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                    }}
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all bg-white shadow-md border border-slate-100"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-2 text-blue-500 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                    <GripVertical className="h-4 w-4" />
                </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="aspect-[3/4] w-full bg-slate-50 rounded-2xl overflow-hidden flex-none relative flex items-center justify-center mb-6 shadow-inner group-hover:shadow-md transition-shadow">
                {mounted && pdfUrl && (
                    <Document
                        file={pdfUrl}
                        className="h-full w-full flex items-center justify-center"
                        loading={loadingSkeleton}
                        error={<FileText className="h-8 w-8 text-slate-300" />}
                    >
                        <Page
                            pageNumber={1}
                            width={160}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    </Document>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />
                </div>
            </div>

            {/* File Info */}
            <div className="w-full text-center">
                <h4 className="text-sm font-black text-slate-900 truncate mb-1" title={file.name}>
                    {file.name}
                </h4>
                <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
            </div>
        </motion.div>
    );
}
