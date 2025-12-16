'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface FindReplaceBarProps {
    isOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    replaceTerm: string;
    onSearchChange: (value: string) => void;
    onReplaceChange: (value: string) => void;
    onFindNext: () => void;
    onFindPrev: () => void;
    onReplace: () => void;
    onReplaceAll: () => void;
    matchCount: number;
    currentMatch: number;
}

export default function FindReplaceBar({
    isOpen,
    onClose,
    searchTerm,
    replaceTerm,
    onSearchChange,
    onReplaceChange,
    onFindNext,
    onFindPrev,
    onReplace,
    onReplaceAll,
    matchCount,
    currentMatch,
}: FindReplaceBarProps) {
    if (!isOpen) return null;

    return (
        <div className="bg-slate-50 px-3 py-2 flex flex-wrap items-center gap-2">
            {/* Find Section */}
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Find..."
                    className="w-40 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                    autoFocus
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFindPrev}
                    className="h-7 w-7 p-0"
                    disabled={matchCount === 0}
                >
                    <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFindNext}
                    className="h-7 w-7 p-0"
                    disabled={matchCount === 0}
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
                <span className="text-xs text-slate-500 min-w-[60px]">
                    {searchTerm ? (matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results') : ''}
                </span>
            </div>

            {/* Replace Section */}
            <div className="flex items-center gap-1">
                <input
                    type="text"
                    value={replaceTerm}
                    onChange={(e) => onReplaceChange(e.target.value)}
                    placeholder="Replace..."
                    className="w-40 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplace}
                    disabled={!searchTerm || matchCount === 0}
                    className="h-7 text-xs px-2"
                >
                    Replace
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplaceAll}
                    disabled={!searchTerm || matchCount === 0}
                    className="h-7 text-xs px-2"
                >
                    All
                </Button>
            </div>

            {/* Close */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0 ml-auto"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}
