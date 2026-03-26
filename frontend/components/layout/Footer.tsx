'use client';

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-12 mt-auto">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center space-x-2 text-white mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
                        <Zap className="w-5 h-5" aria-hidden="true" />
                        <span className="text-xl font-bold tracking-tight">PdfWiser</span>
                    </Link>
                    <p className="mb-4 max-w-sm text-slate-400">
                        The ultimate suite of PDF tools for professionals. Convert, edit, and manage your documents with ease and privacy.
                    </p>
                </div>

                <div>
                    <h2 className="text-white font-bold mb-4 text-base">Tools</h2>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/tools/markdown-to-pdf" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Markdown to PDF</Link></li>
                        <li><Link href="/tools/merge-pdf" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Merge PDFs</Link></li>
                        <li><Link href="/tools/compress-pdf" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Compress PDF</Link></li>
                        <li><Link href="/tools/image-to-pdf" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Image to PDF</Link></li>
                        <li><Link href="/tools/pdf-to-image" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">PDF to Image</Link></li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-white font-bold mb-4 text-base">Legal</h2>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/privacy-policy" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">Contact Us</Link></li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} PdfWiser. All rights reserved.
            </div>
        </footer>
    );
}
