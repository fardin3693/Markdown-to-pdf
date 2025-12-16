'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    FileText,
    FileCode,
    Settings,
    ChevronDown,
    Printer,
} from 'lucide-react';

interface ExportPanelProps {
    onExportHTML: () => void;
    onExportPDF: () => void;
    onPrint: () => void;
    onOpenPDFOptions: () => void;
    isConverting: boolean;
}

export default function ExportPanel({
    onExportHTML,
    onExportPDF,
    onPrint,
    onOpenPDFOptions,
    isConverting,
}: ExportPanelProps) {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="flex items-center gap-2">
            {/* Main Convert Button */}
            <Button
                onClick={onExportPDF}
                disabled={isConverting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-9 text-xs uppercase tracking-wide"
            >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
            </Button>

            {/* Export Dropdown */}
            <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="h-9 px-3 border-slate-300 text-slate-600"
                >
                    Export
                    <ChevronDown className="ml-1 h-3 w-3" />
                </Button>

                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                            <button
                                onClick={() => {
                                    onExportHTML();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                                <FileCode className="h-4 w-4" />
                                Export as HTML
                            </button>
                            <button
                                onClick={() => {
                                    onExportPDF();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                                <FileText className="h-4 w-4" />
                                Export as PDF
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                                onClick={() => {
                                    onPrint();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                            >
                                <Printer className="h-4 w-4" />
                                Print Preview
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* PDF Options Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={onOpenPDFOptions}
                className="h-9 px-3 border-slate-300 text-slate-600"
                title="PDF Options"
            >
                <Settings className="h-4 w-4" />
            </Button>
        </div>
    );
}
