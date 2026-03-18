'use client';

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ArrowRight, 
    FileText, 
    Settings, 
    Upload, 
    Zap, 
    Download, 
    Layers, 
    Minimize2, 
    Image as ImageIcon, 
    CheckCircle2, 
    Star, 
    Shield, 
    Layout, 
    Clock, 
    Search, 
    Trash2, 
    Scissors,
    Sparkles,
    RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
    {
        id: 'markdown-to-pdf',
        title: 'Markdown to PDF',
        description: 'Convert your Markdown files to professional PDF documents with LaTeX support.',
        href: '/tools/markdown-to-pdf',
        icon: Sparkles,
        color: 'text-amber-600',
        bg: 'bg-amber-600/10',
        border: 'border-amber-600/20',
        active: true,
    },
    {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce your PDF file size while maintaining maximum quality.',
        href: '/tools/compress-pdf',
        icon: Minimize2,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        active: true,
    },
    {
        id: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Combine multiple PDF documents into a single professional file.',
        href: '/tools/merge-pdf',
        icon: Layers,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        active: true,
    },
    {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages or split a PDF into separate documents.',
        href: '/tools/split-pdf',
        icon: Scissors,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        active: true,
    },
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF',
        description: 'Convert DOC and DOCX documents to high-fidelity PDF.',
        href: '/tools/doc-to-pdf',
        icon: FileText,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/20',
        active: true,
    },
    {
        id: 'ppt-to-pdf',
        title: 'PowerPoint to PDF',
        description: 'Convert your presentations to PDF with perfect layout.',
        href: '/tools/ppt-to-pdf',
        icon: ImageIcon,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        active: true,
    },
    {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert spreadsheets to clean, readable PDF tables.',
        href: '/tools/excel-to-pdf',
        icon: FileText,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        active: true,
    },
    {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Turn your PDFs back into editable Word documents.',
        href: '/tools/pdf-to-word',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-600/10',
        border: 'border-blue-600/20',
        active: true,
    },
    {
        id: 'pdf-to-excel',
        title: 'PDF to Excel',
        description: 'Extract table data from PDFs into clean Excel sheets.',
        href: '/tools/pdf-to-excel',
        icon: FileText,
        color: 'text-green-600',
        bg: 'bg-green-600/10',
        border: 'border-green-600/20',
        active: true,
    },
    {
        id: 'pdf-to-ppt',
        title: 'PDF to PPT',
        description: 'Convert PDF documents into editable slides.',
        href: '/tools/pdf-to-ppt',
        icon: ImageIcon,
        color: 'text-orange-600',
        bg: 'bg-orange-600/10',
        border: 'border-orange-600/20',
        active: true,
    },
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Combine JPG, PNG, and WebP images into one PDF.',
        href: '/tools/image-to-pdf',
        icon: ImageIcon,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        active: true,
    },
    {
        id: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert each PDF page into high-quality images.',
        href: '/tools/pdf-to-image',
        icon: ImageIcon,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        active: true,
    },
    {
        id: 'remove-pdf-pages',
        title: 'Remove Pages',
        description: 'Precisely delete unnecessary pages from your PDF.',
        href: '/tools/remove-pdf-pages',
        icon: Trash2,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        active: true,
    },
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate individual pages or the entire PDF in any direction.',
        href: '/tools/rotate-pdf',
        icon: RotateCw,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        active: true,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTools = useMemo(() => 
        TOOLS.filter(tool =>
            tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        ), [searchQuery]
    );

    return (
        <div className="relative min-h-screen">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="container mx-auto px-6 pt-24 pb-32">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-24">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm border border-slate-200 px-4 py-1.5 rounded-full text-sm font-medium mb-8 text-slate-600 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>The modern standard for PDF processing</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8"
                    >
                        Master your documents with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">PdfWiser Intelligence.</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl leading-relaxed"
                    >
                        A refined suite of powerful, high-performance tools to refine, convert, and orchestrate your PDF workflow. 100% Free. Completely Private.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full max-w-xl relative group mb-12"
                    >
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find a tool (e.g. compress, merge, split...)"
                            className="block w-full pl-12 pr-6 py-5 bg-white border border-slate-200 rounded-2xl leading-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-xl shadow-slate-200/40 transition-all duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </motion.div>
                </div>

                {/* Tools Grid */}
                <section id="tools" className="scroll-mt-32">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.length > 0 ? (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {filteredTools.map((tool) => (
                                    <motion.div
                                        key={tool.id}
                                        variants={itemVariants}
                                        layout
                                    >
                                        <Link href={tool.href} className="group block h-full">
                                            <div className={cn(
                                                "h-full bg-white p-8 rounded-[2rem] border transition-all duration-500 flex flex-col",
                                                "hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1",
                                                tool.border,
                                                "group-hover:border-transparent"
                                            )}>
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110",
                                                    tool.bg,
                                                    tool.color
                                                )}>
                                                    <tool.icon className="w-7 h-7" />
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-3 transition-colors group-hover:text-blue-600">
                                                    {tool.title}
                                                </h3>
                                                <p className="text-slate-500 leading-relaxed mb-8 flex-1">
                                                    {tool.description}
                                                </p>

                                                <div className="flex items-center text-sm font-bold text-slate-900">
                                                    <span className="relative overflow-hidden group/text">
                                                        <span className="block group-hover:translate-y-[-100%] transition-transform duration-300">Launch Tool</span>
                                                        <span className="absolute inset-0 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 text-blue-600">Let's go</span>
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 ml-2 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-32"
                            >
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No matching tools found</h3>
                                <p className="text-slate-500 mb-8">Try searching for something else or browse all tools.</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                                >
                                    Clear search
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Performance Section */}
                <section id="features" className="mt-48">
                    <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/20 blur-[100px] pointer-events-none" />
                        
                        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                                    Built for speed. <br />
                                    Designed for privacy.
                                </h2>
                                <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                                    We've engineered PdfWiser to be the fastest document processor on the web. No queues, no limits, no compromises.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {[
                                        { title: "Secure Processing", desc: "Files never leave your control." },
                                        { title: "High Fidelity", desc: "Pixel-perfect conversion quality." },
                                        { title: "No Watermarks", desc: "Professional output every time." },
                                        { title: "Instant Results", desc: "Optimized serverless performance." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex space-x-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-1">
                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1">{item.title}</h4>
                                                <p className="text-sm text-slate-500">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="relative aspect-square lg:aspect-video rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-white/5 backdrop-blur-3xl p-8 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <Layers className="w-64 h-64 text-blue-500" />
                                </div>
                                <div className="text-center z-10">
                                    <div className="text-6xl font-black mb-2">99.9%</div>
                                    <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">Processing Accuracy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <section className="mt-48 text-center">
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-16">Trusted by Document Professionals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { name: "Sarah Chen", role: "Technical Writer", text: "The Markdown engine is impeccable. Finally, a tool that respects complex formatting and LaTeX." },
                            { name: "Marcus Thorne", role: "Operations Lead", text: "We've integrated PdfWiser tools into our weekly workflow. The speed is genuinely impressive." },
                            { name: "Elena Rodriguez", role: "Creative Director", text: "Clean, distraction-free, and professional. It's rare to find free tools with this level of polish." }
                        ].map((testimonial, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="flex text-amber-500 mb-6 space-x-1">
                                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-slate-600 text-lg italic mb-8">"{testimonial.text}"</p>
                                <div>
                                    <div className="font-bold text-slate-900">{testimonial.name}</div>
                                    <div className="text-sm text-slate-500 font-medium">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
