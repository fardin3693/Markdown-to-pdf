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
import rehypeSlug from 'rehype-slug';

import remarkHeadingId from 'remark-heading-id';

export const convertToHtml = async (markdown: string, options: any = {}): Promise<string> => {
    // Standard PDF generation CSS (Puppeteer handles margins, so we zero out padding to avoid double spacing)
    // This ensures that when Puppeteer prints, there are no extra margins from the body.
    const printCss = `
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
    `;

    const file = await unified()
        .use(remarkParse)
        .use(remarkHeadingId)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeKatex)
        .use(rehypeSlug)
        .use(rehypeDocument, {
            title: 'Markdown to PDF',
            css: [
                // Served locally – no external CDN dependency during Puppeteer rendering.
                `http://localhost:${process.env.PORT || 3001}/assets/github-markdown.min.css`,
                `http://localhost:${process.env.PORT || 3001}/assets/katex.min.css`,
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
                
                ${printCss}
            `,
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(markdown);

    return String(file).replace('<body>', '<body class="markdown-body">');
};
