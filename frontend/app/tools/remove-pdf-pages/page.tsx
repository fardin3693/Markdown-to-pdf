import type { Metadata } from 'next';
import RemovePdfPagesClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/remove-pdf-pages`;

export const metadata: Metadata = {
    title: 'Remove PDF Pages Online - Free Page Deleter',
    description: 'Remove or delete specific pages from your PDF online for free. Select individual or multiple pages to delete instantly. Fast, secure, and no registration required.',
    keywords: ['remove pdf pages', 'delete pdf pages', 'pdf page remover', 'remove pages from pdf', 'delete pages from pdf', 'free remove pdf pages', 'online pdf page deleter'],
    openGraph: {
        title: 'Remove PDF Pages Online - Free Page Deleter | PdfWiser',
        description: 'Delete specific pages from your PDF online for free. Select pages visually and remove them instantly.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Remove PDF Pages Online - Free Page Deleter',
        description: 'Delete pages from PDFs for free. Select and remove pages visually, instant download.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function RemovePdfPagesPage() {
    return <RemovePdfPagesClient />;
}
