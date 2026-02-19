import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function findLibreOfficePath(): Promise<string | undefined> {
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

    try {
        const { stdout } = await execAsync('where soffice');
        return stdout.trim().split('\n')[0];
    } catch {
        return undefined;
    }
}

export const convertPptToPdf = async (inputPath: string, outputPath: string): Promise<void> => {
    const libreOfficePath = await findLibreOfficePath();
    
    if (!libreOfficePath) {
        throw new Error('LibreOffice not found. Please ensure LibreOffice is installed.');
    }

    const dir = path.dirname(outputPath);
    const inputBasenameWithoutExt = path.parse(inputPath).name;
    
    const cmd = `"${libreOfficePath}" --headless --convert-to pdf --outdir "${dir}" "${inputPath}"`;

    try {
        await execAsync(cmd);
        
        const libreOfficeOutput = path.join(dir, `${inputBasenameWithoutExt}.pdf`);
        
        if (await fs.pathExists(libreOfficeOutput)) {
            if (libreOfficeOutput !== outputPath) {
                await fs.move(libreOfficeOutput, outputPath, { overwrite: true });
            }
        } else {
            throw new Error(`PDF was not created. Expected at: ${libreOfficeOutput}`);
        }
    } catch (error: any) {
        console.error('PPT conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    }
};
