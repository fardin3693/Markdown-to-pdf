import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PYTHON_PATH = process.env.PYTHON_PATH || 'C:\\Users\\fardi\\AppData\\Local\\Programs\\Python\\Python314\\python.exe';

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

export const convertPdfToPpt = async (inputPath: string, outputPath: string): Promise<void> => {
    const script = `
import sys
import fitz
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os
import math

input_path = sys.argv[1]
output_path = sys.argv[2]

def parse_color(color_int):
    if color_int < 0:
        return RGBColor(0, 0, 0)
    r = (color_int >> 16) & 0xFF
    g = (color_int >> 8) & 0xFF
    b = color_int & 0xFF
    return RGBColor(r, g, b)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

doc = fitz.open(input_path)

for page_num in range(len(doc)):
    page = doc[page_num]
    
    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)
    
    page_rect = page.rect
    page_width = page_rect.width
    page_height = page_rect.height
    
    scale_x = prs.slide_width / page_width
    scale_y = prs.slide_height / page_height
    scale = min(scale_x, scale_y)
    
    offset_x = (prs.slide_width - page_width * scale) / 2
    offset_y = (prs.slide_height - page_height * scale) / 2
    
    text_dict = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
    
    text_elements = []
    
    for block in text_dict.get("blocks", []):
        if "lines" not in block:
            continue
        
        block_text = ""
        block_info = None
        block_bbox = None
        
        for line in block["lines"]:
            for span in line["spans"]:
                text = span.get("text", "").strip()
                if text:
                    if block_info is None:
                        block_info = {
                            "font": span.get("font", "Arial"),
                            "size": span.get("size", 12),
                            "color": span.get("color", 0),
                            "flags": span.get("flags", 0),
                        }
                        block_bbox = line["bbox"]
                    block_text += span.get("text", "")
        
        if block_text.strip() and block_info:
            text_elements.append({
                "text": block_text.strip(),
                "bbox": block_bbox,
                "info": block_info
            })
    
    for elem in text_elements:
        bbox = elem["bbox"]
        info = elem["info"]
        
        left = max(0, bbox[0]) * scale + offset_x
        top = max(0, bbox[1]) * scale + offset_y
        width = max(Inches(0.5), (bbox[2] - bbox[0]) * scale * 1.2)
        height = max(Inches(0.2), (bbox[3] - bbox[1]) * scale * 1.5)
        
        try:
            shape = slide.shapes.add_textbox(left, top, width, height)
            tf = shape.text_frame
            tf.word_wrap = True
            tf.auto_size = None
            
            p = tf.paragraphs[0]
            p.text = elem["text"]
            
            font_size = max(6, min(72, info["size"] * scale * 0.8))
            p.font.size = Pt(font_size)
            p.font.name = info["font"]
            
            color = parse_color(info["color"])
            p.font.color.rgb = color
            
            flags = info.get("flags", 0)
            p.font.bold = bool(flags & 16)
            p.font.italic = bool(flags & 2)
            
        except Exception as e:
            print(f"Warning: {e}", file=sys.stderr)
    
    images = page.get_images(full=True)
    for img_index, img in enumerate(images):
        try:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            temp_img_path = os.path.join(os.path.dirname(output_path), f"temp_img_{page_num}_{img_index}.{image_ext}")
            with open(temp_img_path, "wb") as f:
                f.write(image_bytes)
            
            img_rects = page.get_image_rects(xref)
            if img_rects:
                rect = img_rects[0]
                img_left = rect.x0 * scale + offset_x
                img_top = rect.y0 * scale + offset_y
                img_width = rect.width * scale
                img_height = rect.height * scale
                
                if img_width > Inches(0.1) and img_height > Inches(0.1):
                    slide.shapes.add_picture(temp_img_path, img_left, img_top, img_width, img_height)
            
            try:
                os.remove(temp_img_path)
            except:
                pass
        except Exception as e:
            print(f"Warning: Image error: {e}", file=sys.stderr)

doc.close()
prs.save(output_path)
print("Conversion completed successfully")
`;

    const tempScript = path.join(path.dirname(outputPath), 'convert_pdf_to_ppt.py');
    
    try {
        await fs.writeFile(tempScript, script);
        
        const { stdout, stderr } = await execAsync(`"${PYTHON_PATH}" "${tempScript}" "${inputPath}" "${outputPath}"`, {
            maxBuffer: 50 * 1024 * 1024
        });
        
        if (stderr && !stderr.includes('Warning')) {
            console.error('Python stderr:', stderr);
        }
        
        if (!await fs.pathExists(outputPath)) {
            throw new Error(`PPTX was not created. Python output: ${stderr || stdout}`);
        }
    } catch (error: any) {
        console.error('PDF to PPT conversion error:', error);
        throw new Error(`Conversion failed: ${error.message}`);
    } finally {
        try {
            await fs.unlink(tempScript);
        } catch {}
    }
};
