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

export const metadata: Metadata = {
    title: {
        default: "PdfWiser - Free Online PDF Tools (Merge, Compress, Markdown, Images)",
        template: "%s | PdfWiser"
    },
    description: "Professional-grade PDF tools for everyone. Merge, Compress, Convert Markdown to PDF, PDF to Image, and more. 100% Free and Secure.",
    keywords: ["markdown to pdf", "merge pdf", "pdf tools", "free pdf converter", "latex to pdf", "compress pdf", "pdf compressor", "image to pdf", "pdf to image"],
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://pdfwiser.com",
        title: "PdfWiser - Professional PDF Tools",
        description: "The ultimate suite of PDF tools. Convert Markdown to PDF, Merge, Compress and Manage PDFs.",
        siteName: "PdfWiser",
    },
    twitter: {
        card: "summary_large_image",
        title: "PdfWiser - Smart PDF Tools",
        description: "Convert Markdown to PDF and manage your documents for free.",
    }
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
