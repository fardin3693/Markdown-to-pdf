import { MetadataRoute } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const tools = [
    { slug: 'compress-pdf', priority: 0.9 },
    { slug: 'merge-pdf', priority: 0.9 },
    { slug: 'split-pdf', priority: 0.9 },
    { slug: 'doc-to-pdf', priority: 0.8 },
    { slug: 'ppt-to-pdf', priority: 0.8 },
    { slug: 'excel-to-pdf', priority: 0.8 },
    { slug: 'pdf-to-word', priority: 0.8 },
    { slug: 'pdf-to-excel', priority: 0.8 },
    { slug: 'pdf-to-ppt', priority: 0.8 },
    { slug: 'image-to-pdf', priority: 0.8 },
    { slug: 'pdf-to-image', priority: 0.8 },
    { slug: 'markdown-to-pdf', priority: 0.8 },
    { slug: 'html-to-pdf', priority: 0.8 },
    { slug: 'rotate-pdf', priority: 0.7 },
    { slug: 'remove-pdf-pages', priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const toolUrls = tools.map(({ slug, priority }) => ({
        url: `${siteUrl}/tools/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority,
    }));

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        ...toolUrls,
        {
            url: `${siteUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${siteUrl}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];
}
