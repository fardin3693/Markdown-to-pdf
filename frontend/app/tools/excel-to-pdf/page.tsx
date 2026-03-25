import type { Metadata } from 'next';
import ExcelToPdfClient from './_client';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const pageUrl = `${siteUrl}/tools/excel-to-pdf`;

export const metadata: Metadata = {
    title: 'Excel to PDF Converter - Free Online XLS to PDF',
    description: 'Convert Excel spreadsheets (XLS, XLSX) to PDF online for free. Preserve formatting, charts, and tables. Fast and high-quality Excel to PDF conversion.',
    keywords: ['excel to pdf', 'xls to pdf', 'xlsx to pdf', 'convert excel to pdf', 'spreadsheet to pdf', 'free excel to pdf', 'online excel to pdf', 'excel converter'],
    openGraph: {
        title: 'Excel to PDF Converter - Free Online | PdfWiser',
        description: 'Convert Excel spreadsheets to PDF online for free. Preserve formatting and charts. Instant conversion.',
        type: 'website',
        url: pageUrl,
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Excel to PDF Converter - Free Online',
        description: 'Convert Excel files to PDF for free. Preserve formatting and charts instantly.',
    },
    alternates: {
        canonical: pageUrl,
    },
};

export default function ExcelToPdfPage() {
    return <ExcelToPdfClient />;
}
