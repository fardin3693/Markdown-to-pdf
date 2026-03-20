import type { Metadata } from 'next';
import HtmlToPdfClient from '@/components/html-to-pdf/HtmlToPdfClient';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const htmlToPdfPath = '/tools/html-to-pdf';
const htmlToPdfUrl = `${siteUrl}${htmlToPdfPath}`;

export const metadata: Metadata = {
    title: 'HTML to PDF Converter - Render Website & HTML Files | PdfWiser',
    description: 'Convert website URLs, pasted HTML, and uploaded HTML files to PDF. Browser-rendered output with viewport, page size, orientation, and margin controls.',
    keywords: [
        'html to pdf',
        'website to pdf',
        'url to pdf',
        'convert webpage to pdf',
        'render html to pdf',
        'online html to pdf converter',
    ],
    openGraph: {
        title: 'HTML to PDF Converter | PdfWiser',
        description: 'Render real webpages or HTML files and export high-quality PDFs with flexible layout controls.',
        type: 'website',
        url: htmlToPdfUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HTML to PDF Converter - Free Online',
        description: 'Convert website URLs and HTML input into browser-rendered PDF files.',
    },
    alternates: {
        canonical: htmlToPdfUrl,
    },
};

export default function HtmlToPdfPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'HTML to PDF Converter',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        description: 'Convert website URLs, pasted HTML, and uploaded HTML files to PDF with browser-rendered fidelity.',
        featureList: 'Website URL conversion, HTML paste, HTML/ZIP upload, viewport controls, long-page PDF mode',
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HtmlToPdfClient />
        </>
    );
}
