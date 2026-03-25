import type { Metadata } from 'next';
import DocToPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/doc-to-pdf`;

export const metadata: Metadata = {
    title: 'Word to PDF Converter - Free Online DOC to PDF',
    description: 'Convert Word documents (DOC, DOCX) to PDF online for free. Preserve formatting, fonts, and layout. Instant Word to PDF conversion with no registration required.',
    keywords: ['word to pdf', 'doc to pdf', 'docx to pdf', 'convert word to pdf', 'word document to pdf', 'free word to pdf', 'online word to pdf', 'doc converter', 'docx converter'],
    openGraph: {
        title: 'Word to PDF Converter - Free Online | PdfWiser',
        description: 'Convert DOC and DOCX files to PDF online for free. Preserve formatting and layout. Instant conversion.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Word to PDF Converter - Free Online',
        description: 'Convert Word documents to PDF for free. Preserve formatting, instant results.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function DocToPdfPage() {
    return <DocToPdfClient />;
}
