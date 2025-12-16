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

export const convertToHtml = async (markdown: string, options: any = {}): Promise<string> => {
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
                    font-size: ${options.fontSize || '16px'} !important;
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
                    font-size: ${options.fontSize || '16px'} !important;
                }
                /* Ensure tables take full width */
                table {
                    width: 100% !important;
                    display: table !important;
                }
                /* Optimize for print */
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
            `,
        })
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(markdown);

    // Apply markdown-body class to body via string replacement since rehype-document puts it on html or body depends on config, 
    // but usually cleaner to just inject the class into the body tag if rehype-document doesn't support class on body easily without extra plugins.
    // Actually rehype-document doesn't easily let us add class to body. 
    // So we will wrap the content in a body with class if proper, but rehype-document creates the full structure.
    // A simpler approach for the specific class is to replace <body> with <body class="markdown-body">

    return String(file).replace('<body>', '<body class="markdown-body">');
};
