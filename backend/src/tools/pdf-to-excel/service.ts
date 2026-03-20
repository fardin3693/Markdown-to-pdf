import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getPythonPath } from '../../runtime/runtimeDependencies';

const execAsync = promisify(exec);

export const convertPdfToExcel = async (inputPath: string, outputPath: string): Promise<void> => {
    const pythonPath = getPythonPath();

    const script = `
import sys
import pdfplumber
import pandas as pd

input_path = sys.argv[1]
output_path = sys.argv[2]

all_tables = []
with pdfplumber.open(input_path) as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

if all_tables:
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        for i, df in enumerate(all_tables):
            df.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)
else:
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        pd.DataFrame().to_excel(writer, sheet_name='No_Data', index=False)
`;

    const tempScript = path.join(path.dirname(outputPath), 'convert_pdf_to_excel.py');
    
    try {
        await fs.writeFile(tempScript, script);
        
        const { stdout, stderr } = await execAsync(`"${pythonPath}" "${tempScript}" "${inputPath}" "${outputPath}"`);
        
        if (stderr && !stderr.includes('WARNING')) {
            console.error('Python stderr:', stderr);
        }
        
        if (!await fs.pathExists(outputPath)) {
            throw new Error(`XLSX was not created. Python output: ${stderr || stdout}`);
        }
    } catch (error: any) {
        console.error('PDF to Excel conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    } finally {
        try {
            await fs.unlink(tempScript);
        } catch {}
    }
};
