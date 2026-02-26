"use client";

import React, { useEffect, useState, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfPageThumbnailProps {
    pdfDoc: PDFDocumentProxy;
    pageNum: number;
}

export default function PdfPageThumbnail({
    pdfDoc,
    pageNum,
}: PdfPageThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer to only render visible thumbnails
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }, // Start loading 200px before visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !pdfDoc || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                setLoading(true);
                const page = await pdfDoc.getPage(pageNum);
                const canvas = canvasRef.current!;
                const context = canvas.getContext("2d");

                if (!context) {
                    setError(true);
                    return;
                }

                // Use a reasonable scale for thumbnails
                const viewport = page.getViewport({ scale: 0.5 });

                // Set canvas dimensions
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                }).promise;

                setLoading(false);
            } catch (err) {
                console.error("Error rendering page:", err);
                setError(true);
                setLoading(false);
            }
        };

        renderPage();
    }, [isVisible, pdfDoc, pageNum]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
        >
            {loading && !error && (
                <div className="absolute inset-0 animate-pulse bg-slate-200" />
            )}
            {error ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    Error
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-full object-contain"
                    style={{ display: loading ? "none" : "block" }}
                />
            )}
        </div>
    );
}
