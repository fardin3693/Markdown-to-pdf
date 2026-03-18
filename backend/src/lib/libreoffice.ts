import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// undefined  = not yet resolved
// null       = resolved but not found
// string     = resolved path
let cachedPath: string | null | undefined = undefined;

async function discoverLibreOfficePath(): Promise<string | null> {
    const winPaths = [
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        'C:\\Program Files\\LibreOffice 24\\program\\soffice.exe',
        'C:\\Program Files\\LibreOffice 25\\program\\soffice.exe',
    ];

    for (const p of winPaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    // Windows fallback
    try {
        const { stdout } = await execAsync('where soffice');
        const found = stdout.trim().split('\n')[0];
        if (found) return found;
    } catch {
        // not on Windows PATH, try Linux/macOS
    }

    // Linux / macOS fallback
    try {
        const { stdout } = await execAsync('which soffice');
        const found = stdout.trim();
        if (found) return found;
    } catch {
        // not found anywhere
    }

    return null;
}

/**
 * Returns the LibreOffice executable path.
 * Discovery runs once at startup (or on first call) and the result is cached
 * for the lifetime of the process, eliminating repeated filesystem probes on
 * every conversion request.
 */
export async function getLibreOfficePath(): Promise<string> {
    if (cachedPath !== undefined) {
        if (cachedPath === null) {
            throw new Error('LibreOffice not found. Please ensure LibreOffice is installed.');
        }
        return cachedPath;
    }

    cachedPath = await discoverLibreOfficePath();

    if (!cachedPath) {
        cachedPath = null;
        throw new Error('LibreOffice not found. Please ensure LibreOffice is installed.');
    }

    return cachedPath;
}

/**
 * Eagerly resolve and cache the LibreOffice path at startup.
 * Logs a warning if not found so the issue is visible immediately
 * instead of only at request time.
 */
export async function initLibreOffice(): Promise<void> {
    try {
        const resolvedPath = await getLibreOfficePath();
        console.log(`[LibreOffice] Found at: ${resolvedPath}`);
    } catch (e) {
        console.warn(`[LibreOffice] Warning: ${(e as Error).message}`);
    }
}
