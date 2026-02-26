import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const privacyPath = '/privacy-policy';
const privacyUrl = `${siteUrl}${privacyPath}`;

export const metadata: Metadata = {
    title: "Privacy Policy | PdfWiser - How We Protect Your Data",
    description: "PdfWiser Privacy Policy - Learn how we protect your data and privacy. We do not store your files. All conversions are processed securely and deleted after download.",
    keywords: ['privacy policy', 'pdfwiser privacy', 'data protection', 'privacy', 'file privacy', 'pdf privacy', 'data security', 'user privacy', 'cookies policy'],
    openGraph: {
        title: "Privacy Policy | PdfWiser",
        description: "PdfWiser Privacy Policy - How we protect your data and privacy.",
        url: privacyUrl,
    },
    alternates: {
        canonical: privacyUrl,
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-500 mb-8">
                        Last updated: February 2026
                    </p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Introduction</h2>
                            <p className="text-slate-600 leading-relaxed">
                                PdfWiser (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our PDF tools and services at pdfwiser.com.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Information We Collect</h2>
                            <div className="text-slate-600 leading-relaxed space-y-4">
                                <p><strong>Files You Upload:</strong> When you use our tools (Markdown to PDF, Merge PDF, Compress PDF, etc.), your files are processed temporarily for the conversion. We do not permanently store your files on our servers after processing is complete.</p>
                                <p><strong>Usage Data:</strong> We may collect anonymous usage statistics such as which tools are used most frequently, page views, and general performance metrics to improve our services.</p>
                                <p><strong>Technical Data:</strong> We may automatically collect information about your device, browser type, IP address, and browsing patterns for security and analytics purposes.</p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
                            <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-2">
                                <li>To provide and maintain our PDF tools and services</li>
                                <li>To process your file conversions and deliver the results</li>
                                <li>To improve, optimize, and develop new features</li>
                                <li>To analyze usage patterns and trends</li>
                                <li>To ensure the security and integrity of our platform</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Data Security</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your files and personal information. Your files are processed securely and are not accessible to other users. All data transfers are encrypted using HTTPS/TLS protocols.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">File Retention</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Files uploaded to PdfWiser are processed in real-time and are automatically deleted from our servers shortly after processing is complete. We do not retain copies of your uploaded files or the generated outputs after you download them.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Cookies</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may use cookies and similar tracking technologies to enhance your experience, analyze site traffic, and for security purposes. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Third-Party Services</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may use third-party services for analytics, hosting, and other operational purposes. These services have their own privacy policies, and we encourage you to review them. We do not sell or share your personal information with third parties for marketing purposes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Children&apos;s Privacy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Your Rights</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. Contact us if you wish to exercise these rights.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Changes to This Policy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                            <p className="text-slate-600 leading-relaxed">
                                If you have questions about this Privacy Policy or our privacy practices, please contact us through our website at pdfwiser.com.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}