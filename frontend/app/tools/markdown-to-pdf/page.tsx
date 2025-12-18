import type { Metadata } from 'next';
import MarkdownToPdfClient from '@/components/markdown-to-pdf/MarkdownToPdfClient';

export const metadata: Metadata = {
    title: 'Markdown to PDF Converter - Free Online Tool | PdfWiser',
    description: 'Convert Markdown to PDF online for free. Support for LaTeX math, syntax highlighting, and custom styling. Real-time preview and instant conversion.',
    keywords: ['markdown to pdf', 'md to pdf', 'convert markdown', 'latex support', 'pdf converter', 'markdown editor', 'free pdf tools'],
    openGraph: {
        title: 'Markdown to PDF Converter | PdfWiser',
        description: 'Professional Markdown to PDF converter with LaTeX support, syntax highlighting, and live preview.',
        type: 'website',
        url: 'https://pdfwiser.com/tools/markdown-to-pdf',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Markdown to PDF Converter | PdfWiser',
        description: 'Convert Markdown documents to PDF instantly. Free and secure.',
    }
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
