'use client';

import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DropZone from '@/components/merge-pdf/DropZone';
import dynamic from 'next/dynamic';

const SortablePdfItem = dynamic(() => import('@/components/merge-pdf/SortablePdfItem'), {
    ssr: false,
});
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download, UploadCloud } from 'lucide-react';
import Link from 'next/link';

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
            // Only hide if we are leaving the window
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

        const formData = new FormData();
        files.forEach(f => {
            formData.append('files', f.file);
        });

        try {
            const response = await fetch('/api/tools/merge-pdf/merge', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Merge failed');
            }

            const blob = await response.blob();
            // Create a new Blob with explicit PDF type to ensure browser recognizes it
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged_document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Failed to merge PDFs. Please try again.');
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative">
            {/* Full Screen Drop Overlay */}
            {isDraggingOnWindow && (
                <div className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-8 rounded-full shadow-2xl animate-bounce">
                        <UploadCloud className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="absolute mt-32 text-2xl font-bold text-blue-600 bg-white/80 px-6 py-2 rounded-full">
                        Drop PDFs anywhere to add
                    </div>
                </div>
            )}

            {/* Tool Title */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-xl font-bold text-slate-800">Merge PDF</h1>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-6 py-8 flex flex-col max-w-6xl">
                {files.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Combine PDF Files</h2>
                            <p className="text-slate-600">Drag and drop your PDFs anywhere to start.</p>
                        </div>
                        <DropZone onFilesDrop={handleFilesDrop} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Files to Merge ({files.length})</h2>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setFiles([])}>Clear All</Button>
                        </div>

                        <div className="p-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={files.map(f => f.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <div className="flex flex-col items-center gap-4 mt-8 pb-20">
                            <DropZone onFilesDrop={handleFilesDrop} />

                            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg flex justify-center z-40">
                                <Button
                                    size="lg"
                                    className="w-full max-w-md text-lg font-bold shadow-xl shadow-blue-500/20"
                                    onClick={handleMerge}
                                    disabled={isMerging || files.length < 2}
                                >
                                    {isMerging ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Merging...
                                        </>
                                    ) : (
                                        <>
                                            Merge {files.length} PDFs
                                            <Download className="w-5 h-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
