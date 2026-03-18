'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DropZone from '@/components/merge-pdf/DropZone';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import UploadProgressCard from '@/components/upload/UploadProgressCard';
import { uploadBlobWithProgress, type TransferPhase, type UploadBlobWithProgressRequest } from '@/lib/upload';

const SortablePdfItem = dynamic(() => import('@/components/merge-pdf/SortablePdfItem'), {
    ssr: false,
});
import { Button } from '@/components/ui/button';
import { Loader2, Download, UploadCloud, Layers, Trash2, Plus, Sparkles } from 'lucide-react';
import ToolPageHeader from '@/components/layout/ToolPageHeader';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

interface PdfFile {
    id: string;
    file: File;
}

export default function MergePdfPage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [isDraggingOnWindow, setIsDraggingOnWindow] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [transferPhase, setTransferPhase] = useState<TransferPhase>('idle');
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);
    const [activeRequest, setActiveRequest] = useState<UploadBlobWithProgressRequest | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFilesDrop = (newFiles: File[]) => {
        const newPdfFiles = newFiles.map(f => ({
            id: generateId(),
            file: f
        }));
        setFiles(prev => [...prev, ...newPdfFiles]);
        setIsDraggingOnWindow(false);
    };

    const handleRemove = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Global Drag & Drop Implementation
    React.useEffect(() => {
        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDraggingOnWindow(true);
            }
        };

        const handleWindowDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.relatedTarget === null) {
                setIsDraggingOnWindow(false);
            }
        };

        const handleWindowDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOnWindow(false);

            if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
                if (droppedFiles.length > 0) {
                    handleFilesDrop(droppedFiles);
                }
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

    const handleMerge = async () => {
        if (files.length < 2) return;
        setIsMerging(true);
        setUploadProgress(0);
        setTransferPhase('uploading');
        setUploadError(undefined);

        const formData = new FormData();
        files.forEach(f => {
            formData.append('files', f.file);
        });

        try {
            const request = uploadBlobWithProgress({
                url: '/api/tools/merge-pdf/merge',
                formData,
                onProgress: setUploadProgress,
                onPhaseChange: (phase) => setTransferPhase(phase === 'done' ? 'processing' : phase)
            });
            setActiveRequest(request);
            const { blob } = await request;
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged_document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setUploadProgress(100);
            setTransferPhase('done');
        } catch (error) {
            console.error(error);
            if (error instanceof Error && error.message === 'Upload aborted.') {
                setTransferPhase('cancelled');
            } else {
                const message = error instanceof Error ? error.message : 'Failed to merge PDFs. Please try again.';
                setTransferPhase('error');
                setUploadError(message);
                alert(message);
            }
        } finally {
            setActiveRequest(null);
            setIsMerging(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            <AnimatePresence>
                {isDraggingOnWindow && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-blue-600/10 backdrop-blur-md flex items-center justify-center p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-12 rounded-[3rem] shadow-2xl border border-blue-100 flex flex-col items-center text-center max-w-lg"
                        >
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                <UploadCloud className="w-12 h-12 text-blue-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">Drop to Add</h2>
                            <p className="text-slate-500 font-medium">Release your files anywhere to add them to the merge queue.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ToolPageHeader title="Merge PDF" />

            <main className="flex-1 container mx-auto px-6 py-12 flex flex-col max-w-6xl">
                <AnimatePresence mode="wait">
                    {files.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex flex-col items-center justify-center"
                        >
                            <div className="text-center mb-12 max-w-xl">
                                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
                                    <Layers className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Combine PDF Files</h2>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                    Join multiple PDF documents into a single professional file in seconds. High-fidelity results, guaranteed.
                                </p>
                            </div>
                            <div className="w-full max-w-2xl">
                                <DropZone onFilesDrop={handleFilesDrop} />
                            </div>
                            
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                                {[
                                    { title: "No File Limits", desc: "Combine as many files as you need." },
                                    { title: "Smart Sorting", desc: "Drag to reorder pages perfectly." },
                                    { title: "Local Privacy", desc: "Your files stay under your control." }
                                ].map((item, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-slate-900 font-bold mb-1">{item.title}</div>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col gap-12"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-100 uppercase tracking-widest">
                                        <Sparkles className="w-3 h-3 fill-current" />
                                        <span>Ready to Merge</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                        Queue <span className="text-slate-400">({files.length})</span>
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl font-bold h-12 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                                        onClick={() => setFiles([])}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>
                                    <Button 
                                        className="rounded-xl font-bold h-12 bg-slate-900 shadow-xl shadow-slate-900/10"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.multiple = true;
                                            input.accept = 'application/pdf';
                                            input.onchange = (e) => {
                                                const files = (e.target as HTMLInputElement).files;
                                                if (files) handleFilesDrop(Array.from(files));
                                            };
                                            input.click();
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add More
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-8 border border-slate-200/50 shadow-inner">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={files.map(f => f.id)}
                                        strategy={rectSortingStrategy}
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {files.map(file => (
                                                <SortablePdfItem
                                                    key={file.id}
                                                    id={file.id}
                                                    file={file.file}
                                                    onRemove={handleRemove}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>

                            <div className="sticky bottom-8 left-0 right-0 z-40 px-6">
                                <motion.div 
                                    initial={{ y: 100 }}
                                    animate={{ y: 0 }}
                                    className="max-w-xl mx-auto bg-slate-900 rounded-[2rem] p-4 shadow-2xl shadow-blue-900/20 border border-white/10 backdrop-blur-xl"
                                >
                                    {isMerging && (
                                        <UploadProgressCard
                                            className="mb-4 border-white/10 bg-white"
                                            fileName={`${files.length} PDF${files.length !== 1 ? 's' : ''} queued for merge`}
                                            fileSizeLabel={`${(files.reduce((sum, current) => sum + current.file.size, 0) / 1024 / 1024).toFixed(2)} MB total`}
                                            progress={uploadProgress}
                                            phase={transferPhase}
                                            error={uploadError}
                                            canCancel={isMerging}
                                            onCancel={() => activeRequest?.abort()}
                                        />
                                    )}
                                    <Button
                                        size="lg"
                                        className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-xl font-black shadow-lg shadow-blue-500/20 transition-all"
                                        onClick={handleMerge}
                                        disabled={isMerging || files.length < 2}
                                    >
                                        {isMerging ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                                Processing Documents...
                                            </>
                                        ) : (
                                            <>
                                                Generate Merged PDF
                                                <Download className="w-6 h-6 ml-3" />
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
