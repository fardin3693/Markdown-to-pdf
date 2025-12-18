'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, FileText, Settings, Upload, Zap, Download, Layers, Minimize2, Image as ImageIcon, CheckCircle2, Star, Shield, Layout, Clock, Search, Menu, X } from "lucide-react";

// Tools Data Configuration
const TOOLS = [
    {
        id: 'markdown-to-pdf',
        title: 'Markdown to PDF',
        description: 'Transform your Markdown documentation into beautifully styled, professional PDF documents instantly. Supports LaTeX & Code highlights.',
        href: '/tools/markdown-to-pdf',
        icon: FileText,
        active: true,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500/30'
    },
    {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into a single, organized document. Drag and drop reordering.',
        href: '/tools/merge-pdf',
        icon: Settings,
        active: true, // While technically a placeholder link, it's an "active" card
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500/30'
    },
    {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce file size while maintaining quality. Choose from multiple compression levels.',
        href: '/tools/compress-pdf',
        icon: Minimize2,
        active: true,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500/30'
    },
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Convert multiple images (JPG, PNG) into a single PDF document with reordering capability.',
        href: '/tools/image-to-pdf',
        icon: FileText,
        active: true,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        hoverBorder: 'hover:border-blue-500/30'
    },
    {
        id: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert PDF pages into high-quality images (PNG) and download them as a ZIP file.',
        href: '/tools/pdf-to-image',
        icon: ImageIcon,
        active: true,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        hoverBorder: 'hover:border-purple-500/30'
    },
    {
        id: 'split-pdf',
        title: 'Split PDFs',
        description: 'Extract pages or split a large PDF file into smaller files.',
        href: '#',
        icon: Zap,
        active: false,
        comingSoon: true,
        color: 'text-slate-400',
        bg: 'bg-slate-200/50',
        hoverBorder: 'hover:border-slate-300'
    }
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filteredTools = TOOLS.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100 to-indigo-50 -skew-y-3 origin-top-left -z-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />


            <main className="container mx-auto px-6 py-12 md:py-20 lg:py-24">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-blue-100/50">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>New Tools Added Weekly</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Wisest Way</span> to <br className="hidden md:block" /> Manage Your PDFs.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                        PdfWiser brings you a suite of powerful, intuitive tools to convert, edit, and organize your documents. 100% Free and Secure.
                    </p>

                    {/* Search Bar */}
                    <div className="w-full max-w-lg relative mb-10 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search tools (e.g. convert, merge...)"
                            className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-full leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-lg shadow-slate-200/50 transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            href="#tools"
                            className="px-8 py-3.5 bg-primary text-white font-semibold rounded-full shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center group"
                        >
                            Explore Tools
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-3.5 bg-white text-slate-700 font-semibold rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Tools Grid */}
                <section id="tools" className="max-w-6xl mx-auto scroll-mt-24">
                    <h2 className="sr-only">Our Tools</h2>

                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredTools.map((tool) => (
                                tool.active ? (
                                    <Link key={tool.id} href={tool.href} className="group">
                                        <div className={`h-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl ${tool.hoverBorder} transition-all duration-300 relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <tool.icon className={`w-24 h-24 ${tool.color}`} />
                                            </div>

                                            <div className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                <tool.icon className="w-6 h-6" />
                                            </div>

                                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                                            <p className="text-slate-600 mb-6 leading-relaxed">
                                                {tool.description}
                                            </p>

                                            <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                                                Try Now <ArrowRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div key={tool.id} className="h-full bg-slate-50/50 p-6 rounded-2xl border border-slate-200 border-dashed relative group hover:bg-slate-100/50 transition-colors">
                                        <div className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-6`}>
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
                        <div className="text-center py-20 text-slate-500">
                            <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg">No tools found matching "{searchQuery}"</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </section>

                {/* Feature Highlights Section */}
                <div id="features" className="mt-24 pt-12 border-t border-slate-200 scroll-mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Why Professionals Choose PdfWiser</h2>
                        <h3 className="text-3xl font-bold text-slate-900 mt-4">Everything you need to work with PDFs</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { icon: Clock, title: "Lightning Fast", desc: "Optimized performance for instant conversions in seconds." },
                            { icon: Shield, title: "Secure & Private", desc: "Files are processed locally or securely and never stored." },
                            { icon: Layout, title: "High Quality", desc: "Preserve formatting, layout, and styling in every document." },
                            { icon: Star, title: "Completely Free", desc: "No hidden fees, watermarks, or limits. Just pure utility." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials Section */}
                <div id="testimonials" className="mt-24 py-16 bg-white rounded-3xl border border-slate-100 shadow-sm scroll-mt-24">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900">Loved by Developers & Writers</h2>
                            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">See what our users have to say about their experience with PdfWiser.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { name: "Sarah Chen", role: "Technical Writer", text: "Finally, a Markdown to PDF converter that actually handles LaTeX correctly. It's a lifesaver for my documentation work." },
                                { name: "Mike Ross", role: "Student", text: "I use this for all my lecture notes. The interface is clean, distraction-free, and the PDF output is perfect for printing." },
                                { name: "David Kim", role: "Software Engineer", text: "Fast, simple, and does exactly what it says. No bloat, no ads, just a great tool. Highly recommended." }
                            ].map((testimonial, i) => (
                                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                                    <div className="flex text-yellow-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-slate-700 italic mb-6">"{testimonial.text}"</p>
                                    <div>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section (Metadata Boost) */}
                <div id="faq" className="mt-24 max-w-4xl mx-auto scroll-mt-24">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            { q: "Is PdfWiser free to use?", a: "Yes, PdfWiser is completely free to use for all features including Markdown conversion and PDF generation." },
                            { q: "Do you store my files?", a: "No. We value your privacy. Your files are processed securely for the conversion and are not permanently stored on our servers." },
                            { q: "Can I convert complex Markdown with Math?", a: "Absolutely. Our Markdown tool supports GitHub Flavored Markdown, Code Highlighting, and LaTeX math equations." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
                                <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                                <p className="text-slate-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

        </div>
    );
}
