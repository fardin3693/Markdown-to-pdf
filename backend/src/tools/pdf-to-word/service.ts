import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PYTHON_PATH = process.env.PYTHON_PATH || 'C:\\Users\\fardi\\AppData\\Local\\Programs\\Python\\Python314\\python.exe';

// Persistent script – written once at deploy time, never recreated per-request.
const SCRIPT_PATH = path.join(__dirname, '../../scripts/convert_pdf_to_word.py');

export const convertPdfToWord = async (inputPath: string, outputPath: string): Promise<void> => {
    try {
        const { stdout, stderr } = await execAsync(
            `"${PYTHON_PATH}" "${SCRIPT_PATH}" "${inputPath}" "${outputPath}"`
        );

        if (stderr && !stderr.includes('WARNING')) {
            console.error('Python stderr:', stderr);
        }

        if (!await fs.pathExists(outputPath)) {
            throw new Error(`DOCX was not created. Python output: ${stderr || stdout}`);
        }
    } catch (error: any) {
        console.error('PDF to Word conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    }
};
