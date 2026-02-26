import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
    display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "PdfWiser - Free Online PDF Tools | Merge, Compress, Convert PDF",
        template: "%s | PdfWiser"
    },
    description: "Free online PDF tools to merge, compress, convert, and edit PDFs. Convert Markdown, Word, Excel, PowerPoint to PDF. No registration required. 100% free and secure.",
    keywords: [
        "pdf tools", "free pdf tools", "merge pdf", "compress pdf", "pdf compressor", 
        "markdown to pdf", "md to pdf", "word to pdf", "excel to pdf", "ppt to pdf",
        "image to pdf", "jpg to pdf", "png to pdf", "pdf to image", "pdf to word",
        "pdf to excel", "pdf to ppt", "split pdf", "extract pdf pages", "remove pdf pages",
        "pdf converter", "free pdf converter", "online pdf tools", "pdf editor",
        "latex to pdf", "markdown converter", "document to pdf", "convert pdf"
    ],
    authors: [{ name: "PdfWiser" }],
    creator: "PdfWiser",
    publisher: "PdfWiser",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteUrl,
        title: "PdfWiser - Free Online PDF Tools | Merge, Compress, Convert",
        description: "Free online PDF tools to merge, compress, convert, and edit PDFs. Convert Markdown, Word, Excel, PowerPoint to PDF. No registration required.",
        siteName: "PdfWiser",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "PdfWiser - Free Online PDF Tools"
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "PdfWiser - Free Online PDF Tools",
        description: "Free online PDF tools to merge, compress, convert, and edit PDFs. 100% free and secure.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: siteUrl,
        languages: {
            "en-US": siteUrl,
        },
    },
    category: "technology",
    classification: "Online PDF Tools",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={nunito.variable} suppressHydrationWarning>
            <body className="font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
