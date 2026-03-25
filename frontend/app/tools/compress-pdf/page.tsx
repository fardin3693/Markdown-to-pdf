import type { Metadata } from 'next';
import CompressPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/compress-pdf`;

export const metadata: Metadata = {
    title: 'Compress PDF Online - Free PDF Compressor',
    description: 'Compress PDF files online for free. Reduce PDF file size up to 90% while maintaining quality. Choose low, standard, or maximum compression. No registration required.',
    keywords: ['compress pdf', 'pdf compressor', 'reduce pdf size', 'shrink pdf', 'pdf compression online', 'free pdf compressor', 'compress pdf online', 'pdf optimizer', 'pdf file size reducer'],
    openGraph: {
        title: 'Compress PDF Online - Free PDF Compressor | PdfWiser',
        description: 'Reduce your PDF file size online for free. Choose your compression level and download instantly. No registration required.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Compress PDF Online - Free PDF Compressor',
        description: 'Reduce PDF file size up to 90% for free. Fast, secure, no registration.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function CompressPdfPage() {
    return <CompressPdfClient />;
}
