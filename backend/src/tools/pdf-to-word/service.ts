import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPythonPath } from '../../runtime/runtimeDependencies';

const execAsync = promisify(exec);

export const convertPdfToWord = async (inputPath: string, outputPath: string): Promise<void> => {
    const pythonPath = getPythonPath();

    const script = `
import sys
from pdf2docx import Converter

input_path = sys.argv[1]
output_path = sys.argv[2]

cv = Converter(input_path)
cv.convert(output_path)
cv.close()
`;

    const tempScript = path.join(path.dirname(outputPath), 'convert_pdf_to_word.py');
    
    try {
        await fs.writeFile(tempScript, script);
        
        const { stdout, stderr } = await execAsync(`"${pythonPath}" "${tempScript}" "${inputPath}" "${outputPath}"`);
        
        if (stderr && !stderr.includes('WARNING')) {
            console.error('Python stderr:', stderr);
        }
        
        if (!await fs.pathExists(outputPath)) {
            throw new Error(`DOCX was not created. Python output: ${stderr || stdout}`);
        }
    } catch (error: any) {
        console.error('PDF to Word conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    } finally {
        try {
            await fs.unlink(tempScript);
        } catch {}
    }
};
