import type { Metadata } from 'next';
import PdfToExcelClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/pdf-to-excel`;

export const metadata: Metadata = {
    title: 'PDF to Excel Converter - Free Online PDF to XLSX',
    description: 'Convert PDF tables to Excel spreadsheets online for free. Extract table data from PDF to XLSX format accurately and instantly. No registration required.',
    keywords: ['pdf to excel', 'pdf to xlsx', 'convert pdf to excel', 'pdf table to excel', 'extract pdf to excel', 'free pdf to excel', 'online pdf to excel', 'pdf to spreadsheet'],
    openGraph: {
        title: 'PDF to Excel Converter - Free Online | PdfWiser',
        description: 'Extract table data from PDFs and convert to Excel spreadsheets online for free. Instant and accurate.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PDF to Excel Converter - Free Online',
        description: 'Convert PDF tables to Excel for free. Extract data accurately with no registration.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function PdfToExcelPage() {
    return <PdfToExcelClient />;
}
