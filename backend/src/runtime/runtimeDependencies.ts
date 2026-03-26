import { execSync } from 'child_process';
import os from 'os';

const isWindows = os.platform() === 'win32';

interface DependencyCheck {
    ok: boolean;
    path: string | null;
    error: string | null;
}

interface RuntimeHealth {
    checks: {
        libreOffice: DependencyCheck;
        python: DependencyCheck;
        ghostscript: DependencyCheck;
    };
}

let libreOfficePath: string | null = null;
let pythonPath: string | null = null;
let ghostscriptBin: string | null = null;

let runtimeHealth: RuntimeHealth = {
    checks: {
        libreOffice: { ok: false, path: null, error: null },
        python: { ok: false, path: null, error: null },
        ghostscript: { ok: false, path: null, error: null },
    },
};

const tryExec = (cmd: string, timeoutMs = 10000): boolean => {
    try {
        execSync(cmd, { stdio: 'ignore', timeout: timeoutMs });
        return true;
    } catch {
        return false;
    }
};

const detectLibreOffice = (): string | null => {
    const candidates = isWindows
        ? [
              'soffice.exe',
              'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
              'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
          ]
        : [
              'libreoffice',
              'soffice',
              '/usr/bin/libreoffice',
              '/usr/bin/soffice',
              '/usr/local/bin/libreoffice',
              '/opt/libreoffice/program/soffice',
          ];

    for (const candidate of candidates) {
        if (tryExec(`"${candidate}" --version`)) return candidate;
    }
    return null;
};

const detectPython = (): string | null => {
    const candidates = isWindows
        ? ['python', 'python3', 'py']
        : ['python3', 'python', '/usr/bin/python3', '/usr/bin/python'];

    for (const candidate of candidates) {
        if (tryExec(`"${candidate}" --version`, 5000)) return candidate;
    }
    return null;
};

const detectGhostscript = (): string | null => {
    // Windows uses gswin64c or gswin32c; Linux/Mac uses gs
    const candidates = isWindows
        ? [
              'gswin64c',
              'gswin32c',
              'gs',
              'C:\\Program Files\\gs\\gs10.05.1\\bin\\gswin64c.exe',
              'C:\\Program Files (x86)\\gs\\gs10.05.1\\bin\\gswin32c.exe',
          ]
        : ['gs', '/usr/bin/gs', '/usr/local/bin/gs'];

    for (const candidate of candidates) {
        if (tryExec(`"${candidate}" --version`, 5000)) return candidate;
    }
    return null;
};

export const initializeRuntimeDependencies = async (): Promise<void> => {
    console.log(`Initializing runtime dependencies (platform: ${os.platform()})...`);

    const loPath = detectLibreOffice();
    if (loPath) {
        libreOfficePath = loPath;
        runtimeHealth.checks.libreOffice = { ok: true, path: loPath, error: null };
        console.log(`LibreOffice found at: ${loPath}`);
    } else {
        runtimeHealth.checks.libreOffice = { ok: false, path: null, error: 'LibreOffice not found' };
        console.warn('LibreOffice not found. Doc/PPT/Excel to PDF conversion will be unavailable.');
    }

    const pyPath = detectPython();
    if (pyPath) {
        pythonPath = pyPath;
        runtimeHealth.checks.python = { ok: true, path: pyPath, error: null };
        console.log(`Python found at: ${pyPath}`);
    } else {
        runtimeHealth.checks.python = { ok: false, path: null, error: 'Python not found' };
        console.warn('Python not found. PDF to Excel/PPT/Word conversion will be unavailable.');
    }

    const gsPath = detectGhostscript();
    if (gsPath) {
        ghostscriptBin = gsPath;
        runtimeHealth.checks.ghostscript = { ok: true, path: gsPath, error: null };
        console.log(`Ghostscript found at: ${gsPath}`);
    } else {
        runtimeHealth.checks.ghostscript = { ok: false, path: null, error: 'Ghostscript not found' };
        console.warn('Ghostscript not found. PDF compression will be unavailable.');
    }

    console.log('Runtime dependency check complete.');
};

export const getLibreOfficePath = (): string => {
    if (!libreOfficePath) {
        throw new Error('LibreOffice is not available on this server. Please install LibreOffice to use this feature.');
    }
    return libreOfficePath;
};

export const getPythonPath = (): string => {
    if (!pythonPath) {
        throw new Error('Python is not available on this server. Please install Python to use this feature.');
    }
    return pythonPath;
};

export const getGhostscriptBin = (): string => {
    if (!ghostscriptBin) {
        throw new Error('Ghostscript is not available on this server. Please install Ghostscript to use this feature.');
    }
    return ghostscriptBin;
};

export const getRuntimeHealth = (): RuntimeHealth => {
    return runtimeHealth;
};
