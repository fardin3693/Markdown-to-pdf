import type { Metadata } from 'next';
import MergePdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/merge-pdf`;

export const metadata: Metadata = {
    title: 'Merge PDF Files Online - Free PDF Merger',
    description: 'Merge multiple PDF files into one document online for free. Drag and drop to reorder pages before combining. Fast, secure PDF merging with no registration required.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger', 'merge pdf files', 'merge pdf online', 'free pdf merger', 'combine pdf files', 'pdf joiner'],
    openGraph: {
        title: 'Merge PDF Files Online - Free PDF Merger | PdfWiser',
        description: 'Combine multiple PDF files into one. Drag and drop to reorder before merging. Free and instant.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Merge PDF Files Online - Free PDF Merger',
        description: 'Combine multiple PDFs into one file for free. Drag to reorder, instant merge.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function MergePdfPage() {
    return <MergePdfClient />;
}
