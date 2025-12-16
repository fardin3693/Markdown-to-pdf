'use client';

import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown-light.css';

interface MarkdownPreviewProps {
    content: string;
    options: {
        fontFamily: string;
        fontSize: string;
        pageSize: string;
        margins: string | { top: string; right: string; bottom: string; left: string };
    };
}

export interface MarkdownPreviewRef {
    scrollToPercentage: (percentage: number) => void;
}

const MarkdownPreview = forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>(
    ({ content, options }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            scrollToPercentage: (percentage: number) => {
                const container = containerRef.current;
                if (!container) return;
                const scrollTop = percentage * (container.scrollHeight - container.clientHeight);
                container.scrollTo({ top: scrollTop, behavior: 'auto' });
            },
        }));

        const containerStyle = useMemo(() => {
            const style: React.CSSProperties = {
                fontFamily: options.fontFamily || 'system-ui, sans-serif',
                fontSize: options.fontSize || '16px',
            };

            if (typeof options.margins === 'object') {
                style.paddingTop = options.margins.top;
                style.paddingRight = options.margins.right;
                style.paddingBottom = options.margins.bottom;
                style.paddingLeft = options.margins.left;
            } else if (options.margins === 'narrow') {
                style.padding = '12.7mm';
            } else if (options.margins === 'wide') {
                style.padding = '50.8mm';
            } else if (options.margins === 'none') {
                style.padding = '0';
            } else {
                style.padding = '25mm'; // Normal
            }

            return style;
        }, [options]);

        return (
            <div className="h-full w-full bg-white overflow-hidden flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex-none flex justify-between items-center">
                    <span>Preview</span>
                    <span className="text-[10px] font-normal text-slate-400">
                        ({options.pageSize})
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto bg-white">
                    <div
                        ref={containerRef}
                        className="markdown-body mx-auto min-h-full"
                        style={{
                            ...containerStyle,
                            maxWidth: '210mm', // A4 width approx, keeps it looking like a page
                            boxSizing: 'border-box',
                            backgroundColor: 'white',
                            color: 'black' // Ensure text is black for proper print preview
                        }}
                    >
                        {content ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeRaw]}
                                components={{
                                    img: ({ src, alt }) => (
                                        <span className="block my-6">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={src || undefined}
                                                alt={alt || 'Image'}
                                                className="max-w-full h-auto rounded-lg shadow-sm"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            {alt && (
                                                <span className="block text-center text-sm text-slate-500 mt-2 italic">
                                                    {alt}
                                                </span>
                                            )}
                                        </span>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300">
                                <p className="font-bold uppercase tracking-widest text-xs">
                                    Preview Area
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
