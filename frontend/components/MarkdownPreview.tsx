'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface MarkdownPreviewProps {
    content: string;
}

export interface MarkdownPreviewRef {
    scrollToPercentage: (percentage: number) => void;
}

const MarkdownPreview = forwardRef<MarkdownPreviewRef, MarkdownPreviewProps>(
    ({ content }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);

        useImperativeHandle(ref, () => ({
            scrollToPercentage: (percentage: number) => {
                const container = containerRef.current;
                if (!container) return;
                const scrollTop = percentage * (container.scrollHeight - container.clientHeight);
                container.scrollTo({ top: scrollTop, behavior: 'auto' });
            },
        }));

        return (
            <div className="h-full w-full bg-white overflow-hidden flex flex-col">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex-none">
                    Preview
                </div>
                <div
                    ref={containerRef}
                    className="flex-1 p-6 md:p-8 overflow-y-auto markdown-body"
                >
                    {content ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200 first:mt-0">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-100">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">
                                        {children}
                                    </h3>
                                ),
                                h4: ({ children }) => (
                                    <h4 className="text-lg font-semibold text-slate-700 mt-4 mb-2">
                                        {children}
                                    </h4>
                                ),
                                h5: ({ children }) => (
                                    <h5 className="text-base font-semibold text-slate-700 mt-4 mb-2">
                                        {children}
                                    </h5>
                                ),
                                h6: ({ children }) => (
                                    <h6 className="text-sm font-semibold text-slate-600 mt-4 mb-2">
                                        {children}
                                    </h6>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-700 leading-7 my-4">{children}</p>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-bold text-slate-900">{children}</strong>
                                ),
                                em: ({ children }) => (
                                    <em className="italic text-slate-800">{children}</em>
                                ),
                                del: ({ children }) => (
                                    <del className="line-through text-slate-500">{children}</del>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-slate-300 bg-slate-50 pl-4 py-2 my-4 italic text-slate-600">
                                        {children}
                                    </blockquote>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-outside pl-6 my-4 space-y-1 text-slate-700">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-outside pl-6 my-4 space-y-1 text-slate-700">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children, className }) => {
                                    const isTask = className?.includes('task-list-item');
                                    return (
                                        <li
                                            className={`leading-7 ${isTask ? 'list-none -ml-6 flex items-start gap-2' : ''}`}
                                        >
                                            {children}
                                        </li>
                                    );
                                },
                                input: ({ type, checked }) => {
                                    if (type === 'checkbox') {
                                        return (
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                readOnly
                                                className="mt-1.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        );
                                    }
                                    return null;
                                },
                                hr: () => <hr className="my-8 border-t-2 border-slate-200" />,
                                img: ({ src, alt }) => (
                                    <span className="block my-6">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={src || undefined}
                                            alt={alt || 'Image'}
                                            className="max-w-full h-auto rounded-lg border border-slate-200 shadow-sm"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <span className="hidden text-sm text-slate-500 italic">
                                            [Image failed to load: {alt || (src as string)}]
                                        </span>
                                        {alt && (
                                            <span className="block text-center text-sm text-slate-500 mt-2 italic">
                                                {alt}
                                            </span>
                                        )}
                                    </span>
                                ),
                                table: ({ children }) => (
                                    <div className="my-6 overflow-x-auto">
                                        <table className="min-w-full border-collapse border border-slate-300 text-sm">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-slate-100">{children}</thead>
                                ),
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => (
                                    <tr className="border-b border-slate-200 hover:bg-slate-50">
                                        {children}
                                    </tr>
                                ),
                                th: ({ children, style }) => (
                                    <th
                                        className="px-4 py-2 font-semibold text-slate-800 border border-slate-300 text-left"
                                        style={style}
                                    >
                                        {children}
                                    </th>
                                ),
                                td: ({ children, style }) => (
                                    <td
                                        className="px-4 py-2 text-slate-700 border border-slate-300"
                                        style={style}
                                    >
                                        {children}
                                    </td>
                                ),
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');

                                    if (!inline && match) {
                                        return (
                                            <pre className="my-4 border border-slate-200 rounded-md p-4 overflow-x-auto">
                                                <code className="text-sm font-mono text-slate-800" {...props}>
                                                    {children}
                                                </code>
                                            </pre>
                                        );
                                    }

                                    return (
                                        <code className="text-slate-800 px-1 font-mono text-sm" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                pre: ({ children }) => (
                                    <pre className="my-4 p-4 overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                                        {children}
                                    </pre>
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
        );
    }
);

MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;
