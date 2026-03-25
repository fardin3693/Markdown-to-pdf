import type { Metadata } from 'next';
import ImageToPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/image-to-pdf`;

export const metadata: Metadata = {
    title: 'Image to PDF Converter - Free JPG & PNG to PDF',
    description: 'Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into a single PDF document. High quality, fast, and no registration required.',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image to pdf', 'photo to pdf', 'picture to pdf', 'free image to pdf', 'online image to pdf', 'jpeg to pdf'],
    openGraph: {
        title: 'Image to PDF Converter - Free JPG & PNG to PDF | PdfWiser',
        description: 'Convert JPG, PNG, and other images to PDF online for free. Combine multiple images into one PDF.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Image to PDF Converter - Free JPG & PNG to PDF',
        description: 'Convert images to PDF for free. Combine multiple photos into one document.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function ImageToPdfPage() {
    return <ImageToPdfClient />;
}
