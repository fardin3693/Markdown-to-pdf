'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Settings, Upload, Zap, Download, Layers, Minimize2, Image as ImageIcon, CheckCircle2, Star, Shield, Layout, Clock, Search, Trash2, Scissors, RotateCw, Globe } from "lucide-react";

const TOOLS = [
    {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce your PDF file size while maintaining quality.',
        href: '/tools/compress-pdf',
        icon: Minimize2,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-400',
        active: true,
    },
    {
        id: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Combine multiple PDF documents into a single file.',
        href: '/tools/merge-pdf',
        icon: Layers,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        hoverBorder: 'hover:border-emerald-400',
        active: true,
    },
    {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages or split a PDF into multiple files.',
        href: '/tools/split-pdf',
        icon: Scissors,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        hoverBorder: 'hover:border-indigo-400',
        active: true,
    },
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF',
        description: 'Convert DOC and DOCX documents to PDF.',
        href: '/tools/doc-to-pdf',
        icon: FileText,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        hoverBorder: 'hover:border-slate-300',
        active: true,
    },
    {
        id: 'ppt-to-pdf',
        title: 'PowerPoint to PDF',
        description: 'Convert your presentations to PDF format.',
        href: '/tools/ppt-to-pdf',
        icon: FileText,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        hoverBorder: 'hover:border-orange-400',
        active: true,
    },
    {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to high-quality PDFs.',
        href: '/tools/excel-to-pdf',
        icon: FileText,
        color: 'text-green-600',
        bg: 'bg-green-50',
        hoverBorder: 'hover:border-green-400',
        active: true,
    },
    {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Turn your PDFs into editable Word documents.',
        href: '/tools/pdf-to-word',
        icon: FileText,
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500',
        active: true,
    },
    {
        id: 'pdf-to-excel',
        title: 'PDF to Excel',
        description: 'Extract table data from PDFs into Excel.',
        href: '/tools/pdf-to-excel',
        icon: FileText,
        color: 'text-green-700',
        bg: 'bg-green-50',
        hoverBorder: 'hover:border-green-500',
        active: true,
    },
    {
        id: 'pdf-to-ppt',
        title: 'PDF to PPT',
        description: 'Convert PDF documents into editable PowerPoint slides.',
        href: '/tools/pdf-to-ppt',
        icon: FileText,
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        hoverBorder: 'hover:border-orange-500',
        active: true,
    },
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Combine JPG and PNG images into a single PDF.',
        href: '/tools/image-to-pdf',
        icon: ImageIcon,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        hoverBorder: 'hover:border-purple-400',
        active: true,
    },
    {
        id: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert each page of a PDF into high-quality images.',
        href: '/tools/pdf-to-image',
        icon: ImageIcon,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        hoverBorder: 'hover:border-pink-400',
        active: true,
    },
    {
        id: 'remove-pdf-pages',
        title: 'Remove PDF Pages',
        description: 'Delete specific pages from your PDF document.',
        href: '/tools/remove-pdf-pages',
        icon: Trash2,
        color: 'text-red-600',
        bg: 'bg-red-50',
        hoverBorder: 'hover:border-red-400',
        active: true,
    },
    {
        id: 'markdown-to-pdf',
        title: 'Markdown to PDF',
        description: 'Convert your Markdown files to professional PDF documents.',
        href: '/tools/markdown-to-pdf',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-400',
        active: true,
    },
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate individual pages or the entire PDF in any direction.',
        href: '/tools/rotate-pdf',
        icon: RotateCw,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        hoverBorder: 'hover:border-violet-400',
        active: true,
    },
    {
        id: 'html-to-pdf',
        title: 'HTML to PDF',
        description: 'Render website URLs or HTML files into browser-accurate PDF output.',
        href: '/tools/html-to-pdf',
        icon: Globe,
        color: 'text-sky-700',
        bg: 'bg-sky-50',
        hoverBorder: 'hover:border-sky-400',
        active: true,
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Is PdfWiser free to use?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, PdfWiser is completely free to use for all features including Markdown conversion and PDF generation."
            }
        },
        {
            "@type": "Question",
            "name": "Do you store my files?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. We value your privacy. Your files are processed securely for the conversion and are not permanently stored on our servers."
            }
        },
        {
            "@type": "Question",
            "name": "Can I convert complex Markdown with Math?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Our Markdown tool supports GitHub Flavored Markdown, Code Highlighting, and LaTeX math equations."
            }
        }
    ]
};

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = TOOLS.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* Decorative Background Elements */}
            <div aria-hidden="true" className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100 to-indigo-50 -skew-y-3 origin-top-left -z-10" />
            <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />

            <div className="container mx-auto px-6 py-12 md:py-20 lg:py-24">
                {/* Hero Section */}
                <section aria-labelledby="hero-heading" className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-blue-100/50">
                        <span aria-hidden="true" className="relative flex h-2 w-2">
                            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>New Tools Added Weekly</span>
                    </div>

                    <h1 id="hero-heading" className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight text-balance">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Wisest Way</span> to <br className="hidden md:block" /> Manage Your PDFs.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                        PdfWiser brings you a suite of powerful, intuitive tools to convert, edit, and organize your documents. 100% Free and Secure.
                    </p>

                    {/* Search Bar */}
                    <div className="w-full max-w-lg relative mb-10 group">
                        <label htmlFor="tool-search" className="sr-only">Search PDF tools</label>
                        <div aria-hidden="true" className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
                        </div>
                        <input
                            id="tool-search"
                            type="search"
                            placeholder="Search tools (e.g. convert, merge…)"
                            className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-full leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg shadow-slate-200/50 transition-[border-color,box-shadow] duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            href="#tools"
                            className="px-8 py-3.5 bg-primary text-white font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            Explore Tools
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            Learn More
                        </Link>
                    </div>
                </section>

                {/* Tools Grid */}
                <section id="tools" aria-labelledby="tools-heading" className="max-w-6xl mx-auto scroll-mt-24">
                    <h2 id="tools-heading" className="text-3xl font-bold text-slate-900 text-center mb-10 text-balance">All PDF Tools</h2>

                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredTools.map((tool) => (
                                tool.active ? (
                                    <Link key={tool.id} href={tool.href} className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
                                        <div className={`h-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl ${tool.hoverBorder} transition-[border-color,box-shadow] duration-300 relative overflow-hidden`}>
                                            <div aria-hidden="true" className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <tool.icon className={`w-24 h-24 ${tool.color}`} />
                                            </div>

                                            <div aria-hidden="true" className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                <tool.icon className="w-6 h-6" />
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                                            <p className="text-slate-600 mb-6 leading-relaxed">
                                                {tool.description}
                                            </p>

                                            <div aria-hidden="true" className="flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                                                Try Now <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div key={tool.id} className="h-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200 border-dashed relative group hover:bg-slate-100/50 transition-colors">
                                        <div aria-hidden="true" className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-6`}>
                                            <tool.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400 mb-3">{tool.title}</h3>
                                        <p className="text-slate-500 mb-6">
                                            {tool.description}
                                        </p>
                                        <span className="inline-block px-3 py-1 bg-slate-200 text-slate-500 text-xs font-semibold rounded-full">Coming Soon</span>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500" role="status" aria-live="polite">
                            <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" aria-hidden="true" />
                            <p className="text-lg">No tools found matching &ldquo;{searchQuery}&rdquo;</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                                aria-label="Clear search and show all tools"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </section>

                {/* Feature Highlights Section */}
                <section id="features" aria-labelledby="features-heading" className="mt-24 pt-12 border-t border-slate-200 scroll-mt-24">
                    <div className="text-center mb-12">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Why Professionals Choose PdfWiser</p>
                        <h2 id="features-heading" className="text-3xl font-bold text-slate-900 mt-4 text-balance">Everything you need to work with PDFs</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: Clock, title: "Lightning Fast", desc: "Optimized performance for instant conversions in seconds." },
                            { icon: Shield, title: "Secure & Private", desc: "Files are processed locally or securely and never stored." },
                            { icon: Layout, title: "High Quality", desc: "Preserve formatting, layout, and styling in every document." },
                            { icon: Star, title: "Completely Free", desc: "No hidden fees, watermarks, or limits. Just pure utility." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div aria-hidden="true" className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" aria-labelledby="testimonials-heading" className="mt-24 py-16 bg-white rounded-3xl border border-slate-100 shadow-sm scroll-mt-24">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 id="testimonials-heading" className="text-3xl font-bold text-slate-900 text-balance">Loved by Developers &amp; Writers</h2>
                            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">See what our users have to say about their experience with PdfWiser.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { name: "Sarah Chen", role: "Technical Writer", text: "Finally, a Markdown to PDF converter that actually handles LaTeX correctly. It\u2019s a lifesaver for my documentation work." },
                                { name: "Mike Ross", role: "Student", text: "I use this for all my lecture notes. The interface is clean, distraction-free, and the PDF output is perfect for printing." },
                                { name: "David Kim", role: "Software Engineer", text: "Fast, simple, and does exactly what it says. No bloat, no ads, just a great tool. Highly recommended." }
                            ].map((testimonial, i) => (
                                <figure key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                                    <div aria-label="5 out of 5 stars" className="flex text-yellow-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-4 h-4 fill-current" aria-hidden="true" />)}
                                    </div>
                                    <blockquote>
                                        <p className="text-slate-700 italic mb-6">&ldquo;{testimonial.text}&rdquo;</p>
                                    </blockquote>
                                    <figcaption>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" aria-labelledby="faq-heading" className="mt-24 max-w-4xl mx-auto scroll-mt-24">
                    <div className="text-center mb-10">
                        <h2 id="faq-heading" className="text-3xl font-bold text-slate-900 text-balance">Frequently Asked Questions</h2>
                    </div>

                    <dl className="space-y-6">
                        {[
                            { q: "Is PdfWiser free to use?", a: "Yes, PdfWiser is completely free to use for all features including Markdown conversion and PDF generation." },
                            { q: "Do you store my files?", a: "No. We value your privacy. Your files are processed securely for the conversion and are not permanently stored on our servers." },
                            { q: "Can I convert complex Markdown with Math?", a: "Absolutely. Our Markdown tool supports GitHub Flavored Markdown, Code Highlighting, and LaTeX math equations." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
                                <dt className="text-lg font-bold text-slate-900 mb-2">{faq.q}</dt>
                                <dd className="text-slate-600">{faq.a}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
}
