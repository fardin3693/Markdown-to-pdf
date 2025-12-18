'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';

interface SearchHighlightMarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    onScrollChange?: (scrollPercentage: number) => void;
    searchTerm?: string;
    matchPositions?: number[];
    currentMatch?: number;
    shouldFocusMatch?: boolean;
}

export interface MarkdownEditorRef {
    insertFormat: (before: string, after: string) => void;
    getTextarea: () => HTMLTextAreaElement | null;
    scrollToPercentage: (percentage: number) => void;
}

// Calculate positions based on value and search term
const calculateMatchPositions = (value: string, searchTerm: string): number[] => {
    if (!searchTerm) return [];

    const positions: number[] = [];
    let match;
    const regex = new RegExp(searchTerm, 'gi');

    while ((match = regex.exec(value)) !== null) {
        positions.push(match.index);
    }

    return positions;
};

const SearchHighlightMarkdownEditor = forwardRef<MarkdownEditorRef, SearchHighlightMarkdownEditorProps>(
    ({ value, onChange, onScrollChange, searchTerm = '', matchPositions = [], currentMatch, shouldFocusMatch }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const [isSyncingFromTextarea, setIsSyncingFromTextarea] = useState(false);

        // Update the displayed content with highlighted matches
        const renderHighlightedContent = useCallback(() => {
            if (!searchTerm.trim()) {
                return value;
            }

            // Calculate positions again to ensure they're accurate
            const calculatedPositions = calculateMatchPositions(value, searchTerm);

            // Split the value by search term occurrences
            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            const parts = value.split(regex);

            return parts.map((part, index) => {
                // Check if this part is a match (case-insensitive)
                if (part.toLowerCase() === searchTerm.toLowerCase()) {
                    // Find current match position to determine if this is the active match
                    const matchIndex = calculatedPositions.findIndex(pos => {
                        // Count how many matches appear before this part
                        const precedingText = value.substring(0, getAbsolutePosition(parts, index));
                        return pos === precedingText.length;
                    });

                    const isCurrentMatch = matchIndex >= 0 &&
                                         matchPositions.includes(getAbsolutePosition(parts, index));

                    return (
                        <mark
                          key={`match-${index}`}
                          className={`${isCurrentMatch ? 'bg-yellow-300' : 'bg-yellow-100'} font-bold`}
                        >
                            {part}
                        </mark>
                    );
                }
                return part;
            });
        }, [value, searchTerm, matchPositions]);

        // Helper function to calculate absolute position of a part in the original text
        const getAbsolutePosition = (parts: string[], index: number): number => {
            let position = 0;
            for (let i = 0; i < index; i++) {
                position += parts[i].length;
            }
            return position;
        };

        // Escape special regex characters
        const escapeRegExp = (string: string): string => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        // Sync content from visible div to textarea
        useEffect(() => {
            if (!isSyncingFromTextarea && containerRef.current) {
                const textarea = textareaRef.current;
                if (textarea) {
                    // Prevent infinite loop
                    textarea.value = value;
                }
            }
        }, [value, isSyncingFromTextarea]);

        // Keep scroll in sync from textarea to the display div
        const handleScroll = () => {
            const textarea = textareaRef.current;
            if (!textarea || !onScrollChange) return;

            const scrollPercentage =
                textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
            onScrollChange(Math.min(1, Math.max(0, isNaN(scrollPercentage) ? 0 : scrollPercentage)));
        };

        // Update textarea selection to highlight current match
        useEffect(() => {
            if (searchTerm && matchPositions.length > 0 && currentMatch !== undefined && currentMatch > 0) {
                const textarea = textareaRef.current;
                if (textarea && matchPositions[currentMatch - 1] !== undefined) {
                    if (shouldFocusMatch) {
                        textarea.focus();
                        const matchPos = matchPositions[currentMatch - 1];
                        textarea.setSelectionRange(matchPos, matchPos + searchTerm.length);

                        // Scroll that position into view
                        textarea.scrollLeft =
                            (matchPos / textarea.value.length) * (textarea.scrollWidth - textarea.clientWidth);
                    }
                }
            }
        }, [currentMatch, searchTerm, matchPositions, shouldFocusMatch]);

        useImperativeHandle(ref, () => ({
            insertFormat: (before: string, after: string) => {
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = value.substring(start, end);

                const newText =
                    value.substring(0, start) +
                    before +
                    selectedText +
                    after +
                    value.substring(end);

                onChange(newText);

                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(
                        start + before.length,
                        start + before.length + selectedText.length
                    );
                }, 0);
            },
            getTextarea: () => textareaRef.current,
            scrollToPercentage: (percentage: number) => {
                const textarea = textareaRef.current;
                if (!textarea) return;
                const scrollTop = percentage * (textarea.scrollHeight - textarea.clientHeight);
                textarea.scrollTop = isNaN(scrollTop) ? 0 : scrollTop;
            },
        }));

        return (
            <div className="h-full w-full bg-white flex flex-col overflow-hidden relative">
                <div className="flex-none bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Markdown Editor
                </div>

                {/* Hidden textarea to handle text input and maintain cursor position */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    onScroll={handleScroll}
                    className="absolute inset-0 w-full h-full p-4 text-sm font-mono leading-relaxed bg-white border-0 resize-none focus:outline-none text-slate-800 placeholder:text-slate-300 overflow-auto opacity-0 z-10"
                    placeholder="# Start writing your markdown here..."
                    spellCheck={false}
                />

                {/* Visible content with highlights - scrolled in sync with the textarea */}
                <div
                    ref={containerRef}
                    className="flex-1 w-full p-4 text-sm font-mono leading-relaxed overflow-auto whitespace-pre-wrap break-words relative z-0"
                    onScroll={(e) => {
                        // Sync the scroll from the div (if user scrolls it directly) to the textarea
                        if (textareaRef.current) {
                            const target = e.target as HTMLElement;
                            textareaRef.current.scrollTop = target.scrollTop;
                            textareaRef.current.scrollLeft = target.scrollLeft;
                        }
                    }}
                >
                    {renderHighlightedContent()}
                </div>
            </div>
        );
    }
);

SearchHighlightMarkdownEditor.displayName = 'SearchHighlightMarkdownEditor';

export default SearchHighlightMarkdownEditor;