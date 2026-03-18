import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MarkdownToPdfClient = dynamic(() => import('@/components/markdown-to-pdf/MarkdownToPdfClient'), {
    loading: () => (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Editor...</p>
            </div>
        </div>
    ),
    ssr: false
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const markdownToPdfPath = '/tools/markdown-to-pdf';
const markdownToPdfUrl = `${siteUrl}${markdownToPdfPath}`;

export const metadata: Metadata = {
    title: 'Markdown to PDF Converter - Free Online | PdfWiser',
    description: 'Convert Markdown to PDF online for free. Support for LaTeX math equations, syntax highlighting, GitHub Flavored Markdown, and custom styling. Real-time preview.',
    keywords: ['markdown to pdf', 'md to pdf', 'convert markdown to pdf', 'markdown converter', 'latex to pdf', 'math equations in pdf', 'markdown editor', 'gfm to pdf', 'github markdown to pdf', 'code highlighting pdf', 'markdown pdf converter', 'free markdown to pdf', 'online markdown converter'],
    openGraph: {
        title: 'Markdown to PDF Converter | PdfWiser',
        description: 'Convert Markdown to PDF with LaTeX support, syntax highlighting, and live preview. 100% free.',
        type: 'website',
        url: markdownToPdfUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Markdown to PDF Converter - Free Online',
        description: 'Convert Markdown documents to PDF instantly. Supports LaTeX and code highlighting.',
    },
    alternates: {
        canonical: markdownToPdfUrl,
    },
};

export default function MarkdownToPdfPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Markdown to PDF Converter',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: 'Convert Markdown to PDF online for free. Support for LaTeX math, syntax highlighting, and custom styling.',
        featureList: 'Markdown conversion, LaTeX support, Syntax highlighting, Real-time preview',
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <MarkdownToPdfClient />
        </>
    );
}
