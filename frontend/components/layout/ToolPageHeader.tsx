'use client';

import Link from 'next/link';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ToolPageHeaderProps {
    title: string;
    showBackButton?: boolean;
}

export default function ToolPageHeader({ title, showBackButton = true }: ToolPageHeaderProps) {
    return (
        <div className="bg-white/50 backdrop-blur-xl border-b border-slate-200 sticky top-[64px] md:top-[73px] z-[90]">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {showBackButton && (
                            <Link
                                href="/"
                                className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="hidden sm:inline">Back to Home</span>
                            </Link>
                        )}
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-5 py-2 bg-blue-50 border border-blue-100/50 rounded-2xl shadow-sm"
                    >
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <h1 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">{title}</h1>
                    </motion.div>
                    
                    <div className="hidden md:block">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white z-10">
                                4.9k
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
