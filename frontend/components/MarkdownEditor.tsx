'use client';

import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';

interface MarkdownEditorProps {
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

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
    ({ value, onChange, onScrollChange, searchTerm, matchPositions, currentMatch, shouldFocusMatch }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const handleScroll = useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea || !onScrollChange) return;

            const scrollPercentage =
                textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
            onScrollChange(Math.min(1, Math.max(0, isNaN(scrollPercentage) ? 0 : scrollPercentage)));
        }, [onScrollChange]);

        // Highlight current match by scrolling to it
        useEffect(() => {
            if (searchTerm && matchPositions && matchPositions.length > 0 && currentMatch && currentMatch > 0) {
                const textarea = textareaRef.current;
                if (textarea) {
                    const pos = matchPositions[currentMatch - 1];
                    if (pos !== undefined) {
                        // Only focus if explicitly requested (not on type)
                        if (shouldFocusMatch) {
                            textarea.focus();
                            textarea.setSelectionRange(pos, pos + searchTerm.length);
                        } else {
                            // Can optionally scroll to view without stealing focus? 
                            // Standard behavior is usually just highlight. 
                            // If we don't focus/select, it's just text.
                            // We can use setSelectionRange WITHOUT focus to prepare the cursor?
                            // No, setSelectionRange usually doesn't scroll unless focused.
                            // We'll leave it alone on type.
                        }
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
            <div className="h-full w-full bg-white flex flex-col overflow-hidden">
                <div className="flex-none bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Markdown Editor
                </div>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    className="flex-1 w-full p-4 text-sm font-mono leading-relaxed bg-white border-0 resize-none focus:outline-none text-slate-800 placeholder:text-slate-300 overflow-auto"
                    placeholder="# Start writing your markdown here..."
                    spellCheck={false}
                />
            </div>
        );
    }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
