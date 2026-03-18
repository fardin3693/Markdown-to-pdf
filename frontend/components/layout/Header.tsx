'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navItems = [
        { name: 'Features', href: '/#features' },
        { name: 'Tools', href: '/#tools' },
        { name: 'Performance', href: '/#performance' },
    ];

    return (
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
                scrolled 
                    ? "py-3 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm" 
                    : "py-6 bg-transparent"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 group relative z-[110]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
                        <div className="relative bg-slate-900 text-white p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-lg">
                            <Zap className="w-5 h-5 fill-blue-400 text-blue-400" />
                        </div>
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                        Pdf<span className="text-blue-600">Wiser</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 backdrop-blur-sm p-1 rounded-full border border-slate-200/50">
                    {navItems.map((item) => (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-all hover:bg-white hover:shadow-sm"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    <Link 
                        href="/#tools" 
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 flex items-center group"
                    >
                        Get Started
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden relative z-[110] p-3 bg-slate-100 rounded-xl text-slate-900 hover:bg-slate-200 transition-colors shadow-sm"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[100] bg-white pt-32 px-6 md:hidden flex flex-col"
                    >
                        <nav className="flex flex-col space-y-2">
                            {navItems.map((item, i) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="text-3xl font-black text-slate-900 hover:text-blue-600 transition-colors block py-4 border-b border-slate-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12"
                        >
                            <Link 
                                href="/#tools"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-5 bg-blue-600 text-white text-lg font-bold rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20"
                            >
                                Get Started Now
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
