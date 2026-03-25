import type { Metadata } from 'next';
import PptToPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/ppt-to-pdf`;

export const metadata: Metadata = {
    title: 'PowerPoint to PDF Converter - Free PPT to PDF',
    description: 'Convert PowerPoint presentations (PPT, PPTX) to PDF online for free. Preserve slides, animations, and formatting. Instant conversion with no registration required.',
    keywords: ['powerpoint to pdf', 'ppt to pdf', 'pptx to pdf', 'convert powerpoint to pdf', 'presentation to pdf', 'free ppt to pdf', 'online ppt to pdf', 'slides to pdf'],
    openGraph: {
        title: 'PowerPoint to PDF Converter - Free Online | PdfWiser',
        description: 'Convert PPT and PPTX files to PDF online for free. Preserve slides and formatting. Instant conversion.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PowerPoint to PDF Converter - Free PPT to PDF',
        description: 'Convert PowerPoint presentations to PDF for free. Preserve all slides instantly.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PptToPdfPage() {
    return <PptToPdfClient />;
}
