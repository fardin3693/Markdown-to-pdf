"use client";

import React from "react";
import { CursorProvider, Cursor, CursorFollow } from "@/components/ui/cursor";

interface ToolsLayoutProps {
  children: React.ReactNode;
}

export default function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <CursorProvider global>
      <Cursor />
      <CursorFollow
        side="bottom"
        sideOffset={15}
        align="end"
        alignOffset={5}
        className="text-sm font-medium text-white bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg"
      >
        PdfWiser Tool
      </CursorFollow>
      {children}
    </CursorProvider>
  );
}
