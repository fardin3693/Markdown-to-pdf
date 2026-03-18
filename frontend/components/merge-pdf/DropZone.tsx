'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileType, Zap, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DropZoneProps {
    onFilesDrop: (files: File[]) => void;
}

export default function DropZone({ onFilesDrop }: DropZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const isPdf = (file: File) => {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsHovering(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsHovering(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsHovering(false);
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
        if (e.target) e.target.value = '';
    }

    const handleClick = () => inputRef.current?.click();

    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            {/* Background Glow */}
            <div className={cn(
                "absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[3rem] blur-2xl opacity-0 transition-opacity duration-500",
                isHovering ? "opacity-100" : "group-hover:opacity-60"
            )} />
            
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    "relative w-full h-80 border-4 border-dashed rounded-[2.5rem] transition-all duration-500 flex flex-col items-center justify-center cursor-pointer bg-white overflow-hidden shadow-2xl shadow-slate-200/50",
                    isHovering 
                        ? "border-blue-500 bg-blue-50/30 shadow-blue-200/50 scale-[1.02]" 
                        : "border-slate-200 hover:border-blue-400 group-hover:shadow-blue-200/20"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {/* Decorative Elements */}
                <div className="absolute top-6 left-6 flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                    <div className="w-2 h-2 rounded-full bg-slate-100" />
                </div>
                
                <div className="absolute bottom-6 right-6">
                    <Sparkles className="w-6 h-6 text-blue-500/20" />
                </div>

                <div className={cn(
                    "w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-700 relative shadow-lg group-hover:shadow-blue-200/50",
                    isHovering ? "bg-blue-600 text-white rotate-12 scale-110" : "bg-blue-50 text-blue-600"
                )}>
                    <Upload className={cn("w-10 h-10 transition-transform duration-500", isHovering && "animate-pulse")} />
                </div>

                <div className="text-center px-8 relative">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                        Drop PDF files <span className="text-blue-600">to Merge</span>
                    </h3>
                    <p className="text-slate-500 font-bold mb-8">
                        or <span className="text-slate-900 underline decoration-blue-500/30 decoration-4 underline-offset-4">browse files</span> on your device
                    </p>
                    
                    <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                            Secure Transfer
                        </div>
                        <div className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                            Instant Merge
                        </div>
                    </div>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileInput}
                />
            </motion.div>
        </div>
    );
}
