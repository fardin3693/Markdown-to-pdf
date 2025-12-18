'use client';

import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect, useState, MutableRefObject } from 'react';

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

// Helper function to escape special regex characters
const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
    ({ value, onChange, onScrollChange, searchTerm, matchPositions = [], currentMatch, shouldFocusMatch }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const contentRef = useRef<HTMLDivElement>(null);
        const [isSyncing, setIsSyncing] = useState(false);

        // Split content into highlighted parts
        const getHighlightedContent = (): (string | { text: string; isMatch: boolean; isCurrent: boolean })[] => {
            if (!searchTerm) return [value];

            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            const parts: (string | { text: string; isMatch: boolean; isCurrent: boolean })[] = [];
            let match;
            let lastIndex = 0;

            while ((match = regex.exec(value)) !== null) {
                // Add text before match
                if (match.index > lastIndex) {
                    parts.push(value.substring(lastIndex, match.index));
                }

                // Add matched text
                const isCurrentMatch = matchPositions.includes(match.index) &&
                    currentMatch !== undefined &&
                    matchPositions.indexOf(match.index) + 1 === currentMatch;

                parts.push({
                    text: match[0],
                    isMatch: true,
                    isCurrent: isCurrentMatch
                });

                lastIndex = match.index + match[0].length;
            }

            // Add remaining text after last match
            if (lastIndex < value.length) {
                parts.push(value.substring(lastIndex));
            }

            return parts;
        };

        // Update content display based on search term
        useEffect(() => {
            if (!contentRef.current) return;

            const content = contentRef.current;
            content.innerHTML = ''; // Clear previous content

            if (!searchTerm) {
                content.textContent = value;
                return;
            }

            const parts = getHighlightedContent();
            parts.forEach(part => {
                if (typeof part === 'string') {
                    content.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.textContent = part.text;
                    span.className = part.isCurrent
                        ? 'bg-yellow-300 font-bold'
                        : 'bg-yellow-100 font-bold';
                    content.appendChild(span);
                }
            });
        }, [value, searchTerm, matchPositions, currentMatch]);

        // Sync scroll between textarea and content div
        const handleScroll = useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea || !onScrollChange) return;

            if (!isSyncing) {
                if (contentRef.current) {
                    contentRef.current.scrollTop = textarea.scrollTop;
                    contentRef.current.scrollLeft = textarea.scrollLeft;
                }
            }

            const scrollPercentage =
                textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
            onScrollChange(Math.min(1, Math.max(0, isNaN(scrollPercentage) ? 0 : scrollPercentage)));
        }, [onScrollChange, isSyncing]);

        // Handle textarea scroll to sync content div
        const handleContentScroll = useCallback(() => {
            if (!isSyncing && textareaRef.current && contentRef.current) {
                setIsSyncing(true);
                textareaRef.current.scrollTop = contentRef.current.scrollTop;
                textareaRef.current.scrollLeft = contentRef.current.scrollLeft;

                setTimeout(() => setIsSyncing(false), 10);
            }
        }, [isSyncing]);

        // Handle content changes from the content div
        const handleContentInput = useCallback(() => {
            if (!isSyncing && contentRef.current) {
                // This is a content-editable approach that might be complex
                // We'll maintain the textarea as the source of truth for now
            }
        }, [isSyncing]);

        // Update the content when value changes (to keep content div in sync)
        useEffect(() => {
            if (!isSyncing && contentRef.current && textareaRef.current) {
                // Only update content if not syncing (to avoid infinite loops)
                textareaRef.current.value = value;
            }
        }, [value, isSyncing]);

        // Add event listener to textarea for real-time typing updates
        useEffect(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const handleInput = () => {
                // This will trigger a re-render with the new value
                // The parent component will pass the updated value as props
            };

            textarea.addEventListener('input', handleInput);
            return () => {
                textarea.removeEventListener('input', handleInput);
            };
        }, []);

        // Highlight current match by scrolling to it
        useEffect(() => {
            if (searchTerm && matchPositions.length > 0 && currentMatch && currentMatch > 0 && textareaRef.current) {
                const textarea = textareaRef.current;
                const matchPos = matchPositions[currentMatch - 1];
                if (matchPos !== undefined) {
                    if (shouldFocusMatch) {
                        textarea.focus();
                        textarea.setSelectionRange(matchPos, matchPos + searchTerm.length);

                        // Calculate line height and position to scroll to
                        const text = value.substring(0, matchPos);
                        const lines = text.split('\n');
                        const lineIndex = lines.length - 1;

                        // This is approximate, we'll use textarea's built-in selection scroll for now
                    }
                }
            }
        }, [currentMatch, searchTerm, matchPositions, shouldFocusMatch, value]);

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

                <div className="relative flex-1 overflow-hidden">
                    {/* Hidden textarea for text input and selection */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={handleScroll}
                        className="absolute inset-0 w-full h-full p-4 text-sm font-mono leading-relaxed bg-transparent border-0 resize-none focus:outline-none text-transparent caret-slate-800 placeholder:text-slate-300 overflow-auto z-10"
                        placeholder="# Start writing your markdown here..."
                        spellCheck={false}
                    />

                    {/* Visible content with highlights - this will display the actual content with highlights */}
                    <div
                        ref={contentRef}
                        onScroll={handleContentScroll}
                        className="absolute inset-0 w-full h-full p-4 text-sm font-mono leading-relaxed overflow-auto whitespace-pre-wrap break-words z-0 text-slate-800 pointer-events-none"
                        style={{
                            backgroundColor: 'transparent',
                            caretColor: '#4B5563', // slate-600
                        }}
                    >
                        {value} {/* This will be replaced by useEffect */}
                    </div>
                </div>
            </div>
        );
    }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;
