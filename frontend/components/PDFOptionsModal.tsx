'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface PDFOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: {
        fontFamily: string;
        fontSize: string;
        pageSize: string;
        margins: string | { top: string; right: string; bottom: string; left: string };
    };
    onOptionsChange: (options: PDFOptionsModalProps['options']) => void;
}

export default function PDFOptionsModal({
    isOpen,
    onClose,
    options,
    onOptionsChange,
}: PDFOptionsModalProps) {
    const [customMargins, setCustomMargins] = useState({
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm',
    });
    const [marginType, setMarginType] = useState<string>('normal');
    const [fontSizeType, setFontSizeType] = useState<string>('12pt');
    const [customFontSize, setCustomFontSize] = useState<string>('12pt');

    // Initialize local state from props
    useEffect(() => {
        if (isOpen) {
            if (typeof options.margins === 'string') {
                setMarginType(options.margins);
            } else {
                setMarginType('custom');
                setCustomMargins(options.margins);
            }

            const predefinedFonts = ['10pt', '11pt', '12pt', '14pt', '16pt'];
            if (predefinedFonts.includes(options.fontSize)) {
                setFontSizeType(options.fontSize);
            } else {
                setFontSizeType('custom');
                setCustomFontSize(options.fontSize);
            }
        }
    }, [isOpen, options]);

    const handleApply = () => {
        const finalMargins = marginType === 'custom' ? customMargins : marginType;
        const finalFontSize = fontSizeType === 'custom' ? customFontSize : fontSizeType;

        onOptionsChange({
            ...options,
            margins: finalMargins,
            fontSize: finalFontSize,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-bold text-slate-900">PDF Options</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Font Family */}
                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <select
                            value={options.fontFamily}
                            onChange={(e) => onOptionsChange({ ...options, fontFamily: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <Label>Font Size</Label>
                        <select
                            value={fontSizeType}
                            onChange={(e) => setFontSizeType(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="10pt">10pt</option>
                            <option value="11pt">11pt</option>
                            <option value="12pt">12pt (Default)</option>
                            <option value="14pt">14pt</option>
                            <option value="16pt">16pt</option>
                            <option value="custom">Custom...</option>
                        </select>
                        {fontSizeType === 'custom' && (
                            <Input
                                value={customFontSize}
                                onChange={(e) => setCustomFontSize(e.target.value)}
                                placeholder="e.g. 18px or 1.2rem"
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Page Size */}
                    <div className="space-y-2">
                        <Label>Page Size</Label>
                        <select
                            value={options.pageSize}
                            onChange={(e) => onOptionsChange({ ...options, pageSize: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="A4">A4 (210 × 297 mm)</option>
                            <option value="Letter">Letter (8.5 × 11 in)</option>
                            <option value="Legal">Legal (8.5 × 14 in)</option>
                            <option value="A3">A3 (297 × 420 mm)</option>
                        </select>
                    </div>

                    {/* Margins */}
                    <div className="space-y-2">
                        <Label>Margins</Label>
                        <select
                            value={marginType}
                            onChange={(e) => setMarginType(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="normal">Normal (1 inch)</option>
                            <option value="narrow">Narrow (0.5 inch)</option>
                            <option value="wide">Wide (2 inch)</option>
                            <option value="none">None</option>
                            <option value="custom">Custom...</option>
                        </select>

                        {marginType === 'custom' && (
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Top</Label>
                                    <Input
                                        value={customMargins.top}
                                        onChange={(e) => setCustomMargins({ ...customMargins, top: e.target.value })}
                                        placeholder="20mm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Right</Label>
                                    <Input
                                        value={customMargins.right}
                                        onChange={(e) => setCustomMargins({ ...customMargins, right: e.target.value })}
                                        placeholder="20mm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Bottom</Label>
                                    <Input
                                        value={customMargins.bottom}
                                        onChange={(e) => setCustomMargins({ ...customMargins, bottom: e.target.value })}
                                        placeholder="20mm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Left</Label>
                                    <Input
                                        value={customMargins.left}
                                        onChange={(e) => setCustomMargins({ ...customMargins, left: e.target.value })}
                                        placeholder="20mm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl sticky bottom-0">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Apply Options
                    </Button>
                </div>
            </div>
        </>
    );
}
