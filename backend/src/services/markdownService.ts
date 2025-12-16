import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeRaw from 'rehype-raw';

export const convertToHtml = async (markdown: string, options: any = {}, isPdf: boolean = false): Promise<string> => {
    // Determine margins for CSS
    let margins = { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' };

    if (typeof options.margins === 'object') {
        margins = options.margins;
    } else if (options.margins === 'narrow') {
        margins = { top: '12.7mm', right: '12.7mm', bottom: '12.7mm', left: '12.7mm' };
    } else if (options.margins === 'wide') {
        margins = { top: '50.8mm', right: '50.8mm', bottom: '50.8mm', left: '50.8mm' };
    } else if (options.margins === 'none') {
        margins = { top: '0', right: '0', bottom: '0', left: '0' };
    }

    // Print-specific CSS to hide headers/footers and apply margins via padding
    const printCss = isPdf ? '' : `
        @media print {
            @page {
                size: auto;
                margin: 0mm;
            }
            body {
                padding: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left} !important;
                margin: 0 !important;
            }
            .markdown-body {
                padding: 0 !important;
                margin: 0 !important;
            }
        }
    `;

    // Standard PDF generation CSS (Puppeteer handles margins, so we zero out padding to avoid double spacing)
    const pdfCss = isPdf ? `
        @media print {
            .markdown-body {
                padding: 0;
                margin: 0;
                max-width: none;
            }
            body {
                padding: 0;
                margin: 0;
                max-width: none;
            }
        }
    ` : '';

    const file = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeKatex)
        .use(rehypeDocument, {
            title: 'Markdown to PDF',
            css: [
                'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown.min.css',
                'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css',
            ],
            style: `
                body {
                    box-sizing: border-box;
                    min-width: 200px;
                    max-width: 980px;
                    margin: 0 auto;
                    padding: 45px;
                    font-family: ${options.fontFamily || 'system-ui, -apple-system, sans-serif'} !important;
                    font-size: ${options.fontSize || '12pt'} !important;
                    background-color: white;
                }
                @media (max-width: 767px) {
                    body {
                        padding: 15px;
                    }
                }
                .markdown-body {
                    box-sizing: border-box;
                    min-width: 200px;
                    max-width: 980px;
                    margin: 0 auto;
                    padding: 45px;
                    font-family: ${options.fontFamily || 'system-ui, -apple-system, sans-serif'} !important;
                    font-size: ${options.fontSize || '12pt'} !important;
                }
                /* Ensure tables take full width */
                table {
                    width: 100% !important;
                    display: table !important;
                }
                
                ${isPdf ? pdfCss : printCss}
            `,
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(markdown);

    return String(file).replace('<body>', '<body class="markdown-body">');
};
