import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let launchPromise: Promise<Browser> | null = null;

/**
 * Returns the shared browser instance, launching it if needed.
 * The browser is kept alive between requests to avoid the ~1-2s
 * Chromium startup cost on every conversion.
 * If the browser crashes/disconnects it will be re-launched on the next call.
 */
export async function getBrowser(): Promise<Browser> {
    // Already have a live browser – reuse it.
    if (browserInstance && browserInstance.connected) {
        return browserInstance;
    }

    // A launch is already in flight (concurrent requests) – wait for it.
    if (launchPromise) {
        return launchPromise;
    }

    launchPromise = puppeteer
        .launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
        .then((browser) => {
            browserInstance = browser;
            launchPromise = null;

            // When the browser process exits unexpectedly, clear the reference
            // so the next request triggers a fresh launch automatically.
            browser.on('disconnected', () => {
                browserInstance = null;
                console.log('[Browser] Browser disconnected – will relaunch on next request');
            });

            console.log('[Browser] Browser launched');
            return browser;
        })
        .catch((err) => {
            launchPromise = null;
            throw err;
        });

    return launchPromise;
}

/**
 * Gracefully close the shared browser.
 * Call this on process exit / SIGTERM so the Chromium process is not orphaned.
 */
export async function closeBrowser(): Promise<void> {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
        console.log('[Browser] Browser closed');
    }
}
