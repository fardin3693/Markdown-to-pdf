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
                    <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:scale-110 transition-transform" aria-hidden="true">
                        <Zap className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">PdfWiser</span>
                </Link>

                {/* Desktop Nav */}
                <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
                    <Link href="/#features" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Features</Link>
                    <Link href="/#tools" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Tools</Link>
                    <Link href="/#testimonials" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">Testimonials</Link>
                    <Link href="/#faq" className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">FAQ</Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    onClick={toggleMenu}
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    {isMobileMenuOpen
                        ? <X className="w-6 h-6" aria-hidden="true" />
                        : <Menu className="w-6 h-6" aria-hidden="true" />
                    }
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="fixed inset-0 z-[90] bg-white h-screen pt-24 px-6 md:hidden motion-safe:animate-in motion-safe:slide-in-from-top-10 motion-safe:fade-in duration-200 flex flex-col"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-4 right-6 p-2 text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        aria-label="Close menu"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                    <nav aria-label="Mobile navigation" className="flex flex-col space-y-6 text-lg font-medium text-slate-600">
                        <Link
                            href="/#features"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="/#tools"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Tools
                        </Link>
                        <Link
                            href="/#testimonials"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Testimonials
                        </Link>
                        <Link
                            href="/#faq"
                            className="py-4 border-b border-slate-100 hover:text-primary transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
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
