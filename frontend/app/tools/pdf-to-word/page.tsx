import type { Metadata } from 'next';
import PdfToWordClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/pdf-to-word`;

export const metadata: Metadata = {
    title: 'PDF to Word Converter - Free Online PDF to DOCX',
    description: 'Convert PDF files to editable Word documents (DOCX) online for free. Preserve text formatting and layout. Fast, secure PDF to Word conversion with no registration.',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to doc', 'free pdf to word', 'online pdf to word', 'pdf word converter', 'pdf to editable word'],
    openGraph: {
        title: 'PDF to Word Converter - Free Online | PdfWiser',
        description: 'Convert PDF files to editable Word documents online for free. Preserve formatting and content.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF to Word Converter - Free Online PDF to DOCX',
        description: 'Convert PDF to editable Word documents for free. Preserve formatting instantly.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PdfToWordPage() {
    return <PdfToWordClient />;
}
