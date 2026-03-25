# PDFWiser - Replit Migration

## Overview
A full-stack PDF conversion web application with a Next.js frontend and Express.js backend.

## Architecture

### Frontend (`frontend/`)
- **Framework**: Next.js 16 with React 19
- **Port**: 5000 (bound to `0.0.0.0` for Replit compatibility)
- **API Proxy**: Next.js rewrites `/api/*` → backend at `http://localhost:3001`
- **Dev command**: `cd frontend && npm run dev`

### Backend (`backend/`)
- **Framework**: Express.js with TypeScript (ts-node)
- **Port**: 3001
- **Dev command**: `cd backend && npm run dev`
- **Runtime dependencies**: LibreOffice, Python 3, Ghostscript, Puppeteer/Chromium

## Tools Supported
- Markdown to PDF (Puppeteer)
- HTML to PDF (Puppeteer)
- Image to PDF
- Merge/Split/Rotate PDF
- Compress PDF (Ghostscript)
- Doc/PPT/Excel to PDF (LibreOffice)
- PDF to Excel/PPT/Word (Python: pdfplumber, pandas)
- PDF to Image
- Remove PDF Pages

## System Dependencies (Nix)
Installed via Replit's Nix environment:
- `libreoffice` — Doc/PPT/Excel conversion
- `ghostscript` — PDF compression
- `chromium` + X11/GTK libs — Puppeteer headless browser
- `python3` — PDF to Office format conversion

## Replit Workflows
1. **Start application** — Frontend on port 5000 (webview)
2. **Backend API** — Express server on port 3001 (console)

## Key Files
- `frontend/next.config.ts` — API rewrite config (proxies `/api/*` to backend)
- `backend/src/index.ts` — Express app entry point with CORS config
- `backend/src/runtime/runtimeDependencies.ts` — Detects LibreOffice and Python at startup

## CORS
Backend accepts requests from:
- `localhost:5000` / `localhost:3000`
- Any `*.replit.dev` or `*.repl.co` domain
- Custom `FRONTEND_URL` env var

## Environment Variables
- `PORT` — Backend port (default: 3001)
- `FRONTEND_URL` — Explicit frontend origin for CORS (optional)
- `NEXT_PUBLIC_API_URL` — Backend URL for Next.js rewrites (default: `http://localhost:3001`)
