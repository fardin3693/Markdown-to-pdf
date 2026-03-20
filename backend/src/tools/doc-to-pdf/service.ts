import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLibreOfficePath } from '../../runtime/runtimeDependencies';

const execAsync = promisify(exec);

export const convertDocxToPdf = async (inputPath: string, outputPath: string): Promise<void> => {
    const libreOfficePath = getLibreOfficePath();

    const dir = path.dirname(outputPath);
    const inputBasenameWithoutExt = path.parse(inputPath).name;
    
    const cmd = `"${libreOfficePath}" --headless --convert-to pdf --outdir "${dir}" "${inputPath}"`;

    try {
        await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
        
        const libreOfficeOutput = path.join(dir, `${inputBasenameWithoutExt}.pdf`);
        
        if (await fs.pathExists(libreOfficeOutput)) {
            if (libreOfficeOutput !== outputPath) {
                await fs.move(libreOfficeOutput, outputPath, { overwrite: true });
            }
        } else {
            throw new Error(`PDF was not created. Expected at: ${libreOfficeOutput}`);
        }
    } catch (error: any) {
        console.error('DOCX conversion error:', error);

        const stderr = typeof error?.stderr === 'string' ? error.stderr.trim() : '';
        const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : '';
        const details = stderr || stdout || error?.message || 'Unknown conversion error';

        throw new Error(`Conversion failed: ${details}`);
    }
};
