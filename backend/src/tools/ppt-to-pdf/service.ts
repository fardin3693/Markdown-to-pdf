import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLibreOfficePath } from '../../runtime/runtimeDependencies';

const execAsync = promisify(exec);

export const convertPptToPdf = async (inputPath: string, outputPath: string): Promise<void> => {
    const libreOfficePath = getLibreOfficePath();

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
