'use client';

import Link from "next/link";
import { useState } from "react";
import { Zap, Menu, X } from "lucide-react";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] border-b border-slate-200">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between relative">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">PdfWiser</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                    <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="/#tools" className="hover:text-primary transition-colors">Tools</Link>
                    <Link href="/#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
                    <Link href="/#faq" className="hover:text-primary transition-colors">FAQ</Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[90] bg-white h-screen pt-24 px-6 md:hidden animate-in slide-in-from-top-10 fade-in duration-200 flex flex-col">
                    <nav className="flex flex-col space-y-6 text-lg font-medium text-slate-600">
                        <Link
                            href="/#features"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/#tools"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tools
                        </Link>
                        <Link
                            href="/#testimonials"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Testimonials
                        </Link>
                        <Link
                            href="/#faq"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
