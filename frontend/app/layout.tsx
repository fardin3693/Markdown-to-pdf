import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
    subsets: ["latin"],
    variable: "--font-nunito",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Markdown to PDF Converter",
    description: "Convert your markdown files to beautifully formatted PDFs",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={nunito.variable}>
            <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
        </html>
    );
}
