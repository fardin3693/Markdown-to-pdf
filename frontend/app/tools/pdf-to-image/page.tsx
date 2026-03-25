import type { Metadata } from 'next';
import PdfToImageClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/pdf-to-image`;

export const metadata: Metadata = {
    title: 'PDF to Image Converter - Free PDF to JPG & PNG',
    description: 'Convert PDF pages to high-quality images (JPG, PNG) online for free. Extract all pages or specific pages as images. Fast, secure PDF to image conversion.',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf to image', 'pdf page to image', 'free pdf to image', 'online pdf to image', 'pdf to jpeg', 'extract images from pdf'],
    openGraph: {
        title: 'PDF to Image Converter - Free PDF to JPG & PNG | PdfWiser',
        description: 'Convert PDF pages to high-quality JPG or PNG images online for free. Download all pages as a ZIP.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF to Image Converter - Free PDF to JPG & PNG',
        description: 'Convert PDF pages to images for free. High quality JPG and PNG output.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PdfToImagePage() {
    return <PdfToImageClient />;
}
