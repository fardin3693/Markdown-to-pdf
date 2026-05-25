import fs from 'fs-extra';
import { execSync } from 'child_process';

const isWindows = process.platform === 'win32';

function runCommand(cmd: string): string | undefined {
    try {
        return execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString().trim().split('\n')[0].trim();
    } catch {
        return undefined;
    }
}

export function findPythonPath(): string {
    if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;

    if (isWindows) {
        const winPaths = [
            'C:\\Python314\\python.exe',
            'C:\\Python313\\python.exe',
            'C:\\Python312\\python.exe',
            'C:\\Python311\\python.exe',
            'C:\\Python310\\python.exe',
            'C:\\Python39\\python.exe',
        ];
        for (const p of winPaths) {
            if (fs.existsSync(p)) return p;
        }
        const found = runCommand('where python');
        if (found) return found;
        return 'python';
    }

    return runCommand('which python3') || runCommand('which python') || 'python3';
}

export function findLibreOfficePath(): string | undefined {
    if (process.env.LIBREOFFICE_PATH) return process.env.LIBREOFFICE_PATH;

    if (isWindows) {
        const winPaths = [
            'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files\\LibreOffice 24\\program\\soffice.exe',
            'C:\\Program Files\\LibreOffice 25\\program\\soffice.exe',
        ];
        for (const p of winPaths) {
            if (fs.existsSync(p)) return p;
        }
        return runCommand('where soffice');
    }

    return runCommand('which soffice');
}

export function getGhostscriptModule(): string {
    if (process.env.GS_MODULE) return process.env.GS_MODULE;

    if (isWindows) {
        const gsWin64 = runCommand('where gswin64c');
        if (gsWin64) return 'gswin64c';
        const gsWin32 = runCommand('where gswin32c');
        if (gsWin32) return 'gswin32c';
        return 'gswin64c';
    }

    return 'gs';
}

export function findChromiumPath(): string | undefined {
    if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;

    if (isWindows) {
        const winPaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files\\Chromium\\Application\\chrome.exe',
        ];
        for (const p of winPaths) {
            if (fs.existsSync(p)) return p;
        }
        return runCommand('where chromium') || runCommand('where chrome');
    }

    return (
        runCommand('which chromium') ||
        runCommand('which chromium-browser') ||
        runCommand('which google-chrome') ||
        runCommand('which google-chrome-stable')
    );
}
