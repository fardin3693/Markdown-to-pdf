import type { Metadata } from 'next';
import PdfToPptClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/pdf-to-ppt`;

export const metadata: Metadata = {
    title: 'PDF to PowerPoint Converter - Free PDF to PPTX',
    description: 'Convert PDF documents to editable PowerPoint (PPTX) slides online for free. Preserve layouts and content. Fast PDF to PPT conversion with no registration required.',
    keywords: ['pdf to ppt', 'pdf to powerpoint', 'pdf to pptx', 'convert pdf to powerpoint', 'pdf to slides', 'free pdf to ppt', 'online pdf to ppt', 'pdf to presentation'],
    openGraph: {
        title: 'PDF to PowerPoint Converter - Free Online | PdfWiser',
        description: 'Convert PDF files to editable PowerPoint slides online for free. Preserve your layouts instantly.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF to PowerPoint Converter - Free PDF to PPTX',
        description: 'Convert PDF to editable PowerPoint slides for free. No registration needed.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PdfToPptPage() {
    return <PdfToPptClient />;
}
