import type { Metadata } from 'next';
import SplitPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/split-pdf`;

export const metadata: Metadata = {
    title: 'Split PDF Online - Free PDF Splitter',
    description: 'Split PDF files into multiple documents online for free. Extract specific pages or split by page ranges. Fast, secure PDF splitting with no registration required.',
    keywords: ['split pdf', 'pdf splitter', 'split pdf online', 'split pdf into pages', 'extract pdf pages', 'divide pdf', 'free pdf splitter', 'online pdf splitter', 'pdf page extractor'],
    openGraph: {
        title: 'Split PDF Online - Free PDF Splitter | PdfWiser',
        description: 'Split PDF files into multiple documents online for free. Extract pages or split by ranges instantly.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Split PDF Online - Free PDF Splitter',
        description: 'Split PDFs into multiple files for free. Extract pages or split by range instantly.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function SplitPdfPage() {
    return <SplitPdfClient />;
}
