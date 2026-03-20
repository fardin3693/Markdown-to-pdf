import dns from 'dns/promises';
import type { LookupAddress } from 'dns';
import fs from 'fs-extra';
import net from 'net';
import path from 'path';
import { pathToFileURL } from 'url';
import extract from 'extract-zip';
import puppeteer, { Browser, Page, PDFMargin, PDFOptions, Viewport } from 'puppeteer';

/**
 * Thrown when user-supplied URL input fails validation.
 * Allows the controller to respond with HTTP 400 instead of 500.
 */
export class UrlValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UrlValidationError';
    }
}

type InputMode = 'url' | 'html' | 'upload';

export interface HtmlToPdfOptions {
    viewportPreset?: 'desktop' | 'tablet' | 'mobile' | 'custom';
    viewportWidth?: number;
    viewportHeight?: number;
    pageSize?: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'custom';
    pageWidth?: string;
    pageHeight?: string;
    orientation?: 'portrait' | 'landscape';
    marginPreset?: 'normal' | 'narrow' | 'wide' | 'none' | 'custom';
    margins?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    printBackground?: boolean;
    singleLongPage?: boolean;
    navigationTimeoutMs?: number;
    renderDelayMs?: number;
}

interface BaseInput {
    mode: InputMode;
    options?: HtmlToPdfOptions;
}

interface UrlInput extends BaseInput {
    mode: 'url';
    url: string;
}

interface HtmlInput extends BaseInput {
    mode: 'html';
    html: string;
}

interface UploadInput extends BaseInput {
    mode: 'upload';
    uploadPath: string;
    originalName: string;
}

type HtmlToPdfInput = UrlInput | HtmlInput | UploadInput;

const MAX_NAVIGATION_TIMEOUT_MS = 120000;
const MIN_NAVIGATION_TIMEOUT_MS = 3000;
const MAX_RENDER_DELAY_MS = 10000;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const getViewport = (options: HtmlToPdfOptions = {}): Viewport => {
    const preset = options.viewportPreset || 'desktop';

    if (preset === 'mobile') {
        return { width: 390, height: 844, deviceScaleFactor: 1 };
    }

    if (preset === 'tablet') {
        return { width: 834, height: 1112, deviceScaleFactor: 1 };
    }

    if (preset === 'custom') {
        const width = clamp(Number(options.viewportWidth) || 1280, 320, 2560);
        const height = clamp(Number(options.viewportHeight) || 720, 320, 2560);
        return { width, height, deviceScaleFactor: 1 };
    }

    return { width: 1366, height: 768, deviceScaleFactor: 1 };
};

const getMargins = (options: HtmlToPdfOptions = {}): PDFMargin => {
    if (options.marginPreset === 'none') {
        return { top: '0', right: '0', bottom: '0', left: '0' };
    }

    if (options.marginPreset === 'narrow') {
        return { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' };
    }

    if (options.marginPreset === 'wide') {
        return { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' };
    }

    if (options.marginPreset === 'custom') {
        return {
            top: options.margins?.top || '15mm',
            right: options.margins?.right || '15mm',
            bottom: options.margins?.bottom || '15mm',
            left: options.margins?.left || '15mm',
        };
    }

    return { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' };
};

const isPrivateIPv4 = (address: string): boolean => {
    const parts = address.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
        return true;
    }

    const [a, b] = parts;

    if (a === 10 || a === 127 || a === 0) {
        return true;
    }

    if (a === 172 && b >= 16 && b <= 31) {
        return true;
    }

    if (a === 192 && b === 168) {
        return true;
    }

    if (a === 169 && b === 254) {
        return true;
    }

    return false;
};

const isPrivateIPv6 = (address: string): boolean => {
    const normalized = address.toLowerCase();

    if (normalized === '::1' || normalized === '::') {
        return true;
    }

    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
        return true;
    }

    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
        return true;
    }

    return false;
};

const assertPublicUrl = async (rawUrl: string): Promise<string> => {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(rawUrl);
    } catch {
        throw new UrlValidationError(
            `"${rawUrl}" is not a valid URL. ` +
            'A URL must include a protocol and hostname, e.g. https://example.com',
        );
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new UrlValidationError(
            `Unsupported protocol "${parsedUrl.protocol.replace(':', '')}". ` +
            'Only http and https URLs are accepted.',
        );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        throw new UrlValidationError(
            'Localhost URLs are not allowed. ' +
            'Please provide a publicly accessible URL.',
        );
    }

    const hostIpVersion = net.isIP(hostname);

    if (hostIpVersion === 4 && isPrivateIPv4(hostname)) {
        throw new UrlValidationError(
            `The IP address "${hostname}" belongs to a private network range and is not allowed. ` +
            'Please provide a publicly accessible URL.',
        );
    }

    if (hostIpVersion === 6 && isPrivateIPv6(hostname)) {
        throw new UrlValidationError(
            `The IPv6 address "${hostname}" belongs to a private network range and is not allowed. ` +
            'Please provide a publicly accessible URL.',
        );
    }

    if (!hostIpVersion) {
        let lookupResults: LookupAddress[];
        try {
            lookupResults = await dns.lookup(hostname, { all: true });
        } catch {
            throw new UrlValidationError(
                `Could not resolve the hostname "${hostname}". ` +
                'Please check that the domain name is spelled correctly and is publicly accessible.',
            );
        }

        if (!lookupResults.length) {
            throw new UrlValidationError(
                `The hostname "${hostname}" did not return any DNS records. ` +
                'Please check that the domain name is spelled correctly and is publicly accessible.',
            );
        }

        for (const result of lookupResults) {
            if ((result.family === 4 && isPrivateIPv4(result.address)) || (result.family === 6 && isPrivateIPv6(result.address))) {
                throw new UrlValidationError(
                    `The hostname "${hostname}" resolves to the private address "${result.address}", which is not allowed. ` +
                    'Only URLs that resolve to public IP addresses are accepted.',
                );
            }
        }
    }

    return parsedUrl.toString();
};

const findFirstHtmlFile = async (dir: string): Promise<string | null> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const preferredIndex = entries.find((entry) => entry.isFile() && entry.name.toLowerCase() === 'index.html');
    if (preferredIndex) {
        return path.join(dir, preferredIndex.name);
    }

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const nestedMatch = await findFirstHtmlFile(fullPath);
            if (nestedMatch) {
                return nestedMatch;
            }
            continue;
        }

        if (entry.isFile() && /\.html?$/i.test(entry.name)) {
            return fullPath;
        }
    }

    return null;
};

const resolveUploadedHtml = async (uploadPath: string, originalName: string): Promise<{ htmlPath: string; extractedDir?: string }> => {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.html' || ext === '.htm') {
        return { htmlPath: uploadPath };
    }

    if (ext !== '.zip') {
        throw new Error('Only .html, .htm, and .zip uploads are supported');
    }

    const tempExtractDir = path.join(path.dirname(uploadPath), `html-assets-${Date.now()}-${Math.round(Math.random() * 1e6)}`);
    await fs.ensureDir(tempExtractDir);

    try {
        await extract(uploadPath, { dir: tempExtractDir });
    } catch (error) {
        await fs.remove(tempExtractDir);
        throw new Error('Failed to extract zip file');
    }

    const htmlPath = await findFirstHtmlFile(tempExtractDir);
    if (!htmlPath) {
        await fs.remove(tempExtractDir);
        throw new Error('No .html file found inside zip archive');
    }

    return { htmlPath, extractedDir: tempExtractDir };
};

const buildPdfOptions = async (
    page: Page,
    options: HtmlToPdfOptions,
    viewport: Viewport,
): Promise<PDFOptions> => {
    const margin = getMargins(options);

    if (options.singleLongPage) {
        const dimensions = await page.evaluate(() => {
            const body = document.body;
            const doc = document.documentElement;

            const width = Math.max(
                body?.scrollWidth || 0,
                body?.offsetWidth || 0,
                doc?.clientWidth || 0,
                doc?.scrollWidth || 0,
                doc?.offsetWidth || 0,
            );

            const height = Math.max(
                body?.scrollHeight || 0,
                body?.offsetHeight || 0,
                doc?.clientHeight || 0,
                doc?.scrollHeight || 0,
                doc?.offsetHeight || 0,
            );

            return { width, height };
        });

        const widthPx = clamp(dimensions.width || viewport.width, 320, 4096);
        const heightPx = clamp(dimensions.height || viewport.height, 320, 30000);

        return {
            width: `${(widthPx / 96).toFixed(2)}in`,
            height: `${(heightPx / 96).toFixed(2)}in`,
            margin,
            printBackground: options.printBackground !== false,
            landscape: false,
            preferCSSPageSize: false,
        };
    }

    const common = {
        margin,
        printBackground: options.printBackground !== false,
        landscape: options.orientation === 'landscape',
    };

    if (options.pageSize === 'custom') {
        return {
            ...common,
            width: options.pageWidth || '210mm',
            height: options.pageHeight || '297mm',
            preferCSSPageSize: false,
        };
    }

    return {
        ...common,
        format: (options.pageSize || 'A4') as PDFOptions['format'],
        preferCSSPageSize: false,
    };
};

const getNavigationTimeout = (options: HtmlToPdfOptions = {}): number => {
    const timeout = Number(options.navigationTimeoutMs) || 45000;
    return clamp(timeout, MIN_NAVIGATION_TIMEOUT_MS, MAX_NAVIGATION_TIMEOUT_MS);
};

const getRenderDelay = (options: HtmlToPdfOptions = {}): number => {
    const delay = Number(options.renderDelayMs) || 0;
    return clamp(delay, 0, MAX_RENDER_DELAY_MS);
};

export const convertHtmlInputToPdf = async (input: HtmlToPdfInput): Promise<Buffer> => {
    const options = input.options || {};
    const viewport = getViewport(options);
    const navigationTimeout = getNavigationTimeout(options);

    let browser: Browser | null = null;
    let extractedDir: string | undefined;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(navigationTimeout);
        page.setDefaultTimeout(navigationTimeout);
        await page.setViewport(viewport);
        await page.emulateMediaType('screen');

        if (input.mode === 'url') {
            const safeUrl = await assertPublicUrl(input.url);
            await page.goto(safeUrl, { waitUntil: 'networkidle0', timeout: navigationTimeout });
        }

        if (input.mode === 'html') {
            await page.setContent(input.html, { waitUntil: 'networkidle0', timeout: navigationTimeout });
        }

        if (input.mode === 'upload') {
            const resolved = await resolveUploadedHtml(input.uploadPath, input.originalName);
            extractedDir = resolved.extractedDir;
            await page.goto(pathToFileURL(resolved.htmlPath).toString(), {
                waitUntil: 'networkidle0',
                timeout: navigationTimeout,
            });
        }

        const renderDelay = getRenderDelay(options);
        if (renderDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, renderDelay));
        }

        const pdfOptions = await buildPdfOptions(page, options, viewport);
        const pdfBuffer = await page.pdf(pdfOptions);

        return Buffer.from(pdfBuffer);
    } finally {
        if (browser) {
            await browser.close();
        }

        if (extractedDir && await fs.pathExists(extractedDir)) {
            await fs.remove(extractedDir);
        }
    }
};
