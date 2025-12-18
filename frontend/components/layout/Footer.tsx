'use client';

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center space-x-2 text-white mb-4">
                        <Zap className="w-5 h-5" />
                        <span className="text-xl font-bold tracking-tight">PdfWiser</span>
                    </Link>
                    <p className="mb-4 max-w-sm text-slate-400">
                        The ultimate suite of PDF tools for professionals. Convert, edit, and manage your documents with ease and privacy.
                    </p>
                </div>

                <div>
                    <h5 className="text-white font-bold mb-4">Tools</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/tools/markdown-to-pdf" className="hover:text-white transition-colors">Markdown to PDF</Link></li>
                        <li><Link href="/tools/merge-pdf" className="hover:text-white transition-colors">Merge PDFs</Link></li>
                        <li><Link href="/tools/compress-pdf" className="hover:text-white transition-colors">Compress PDF</Link></li>
                        <li><Link href="/tools/image-to-pdf" className="hover:text-white transition-colors">Image to PDF</Link></li>
                        <li><Link href="/tools/pdf-to-image" className="hover:text-white transition-colors">PDF to Image</Link></li>
                    </ul>
                </div>

                <div>
                    <h5 className="text-white font-bold mb-4">Legal</h5>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} PdfWiser. All rights reserved.
            </div>
        </footer>
    );
}
