import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLibreOfficePath } from '../../lib/libreoffice';

const execAsync = promisify(exec);

export const convertDocxToPdf = async (inputPath: string, outputPath: string): Promise<void> => {
    const libreOfficePath = await getLibreOfficePath();

    const absInputPath = path.resolve(inputPath);
    const absOutputPath = path.resolve(outputPath);

    const dir = path.dirname(absOutputPath);
    const inputBasenameWithoutExt = path.parse(absInputPath).name;
    
    const cmd = `"${libreOfficePath}" --headless --convert-to pdf --outdir "${dir}" "${absInputPath}"`;

    try {
        await execAsync(cmd);
        
        const libreOfficeOutput = path.join(dir, `${inputBasenameWithoutExt}.pdf`);
        
        if (await fs.pathExists(libreOfficeOutput)) {
            if (libreOfficeOutput !== absOutputPath) {
                await fs.move(libreOfficeOutput, absOutputPath, { overwrite: true });
            }
        } else {
            throw new Error(`PDF was not created. Expected at: ${libreOfficeOutput}`);
        }
    } catch (error: any) {
        console.error('DOCX conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    }
};
