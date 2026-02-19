'use client';

import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

interface ToolPageHeaderProps {
    title: string;
    showBackButton?: boolean;
}

export default function ToolPageHeader({ title, showBackButton = true }: ToolPageHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showBackButton && (
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Link>
                        )}
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-lg font-bold text-slate-900 hidden sm:inline-block">PdfWiser</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800">{title}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
