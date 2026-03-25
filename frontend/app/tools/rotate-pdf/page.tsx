import type { Metadata } from 'next';
import RotatePdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/rotate-pdf`;

export const metadata: Metadata = {
    title: 'Rotate PDF Pages Online - Free PDF Rotator',
    description: 'Rotate PDF pages online for free. Rotate individual pages or the entire document 90°, 180°, or 270°. Instant results with no registration required.',
    keywords: ['rotate pdf', 'pdf rotator', 'rotate pdf pages', 'rotate pdf online', 'flip pdf', 'turn pdf pages', 'free pdf rotator', 'online pdf rotator', 'rotate pdf 90 degrees'],
    openGraph: {
        title: 'Rotate PDF Pages Online - Free PDF Rotator | PdfWiser',
        description: 'Rotate individual pages or entire PDF documents online for free. 90°, 180°, or 270° rotation.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Rotate PDF Pages Online - Free PDF Rotator',
        description: 'Rotate PDF pages 90°, 180°, or 270° for free. Instant results, no registration.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function RotatePdfPage() {
    return <RotatePdfClient />;
}
