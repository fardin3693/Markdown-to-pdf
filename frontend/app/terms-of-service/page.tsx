import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
const termsPath = '/terms-of-service';
const termsUrl = `${siteUrl}${termsPath}`;

export const metadata: Metadata = {
    title: "Terms of Service | PdfWiser - Terms and Conditions",
    description: "PdfWiser Terms of Service - Terms and conditions for using our free online PDF tools. Learn about user responsibilities, intellectual property, and disclaimers.",
    keywords: ['terms of service', 'terms and conditions', 'pdfwiser terms', 'terms', 'conditions', 'user agreement', 'service terms', 'legal terms'],
    openGraph: {
        title: "Terms of Service | PdfWiser",
        description: "PdfWiser Terms of Service - Terms and conditions for using our PDF tools.",
        url: termsUrl,
    },
    alternates: {
        canonical: termsUrl,
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-slate-500 mb-8">
                        Last updated: February 2026
                    </p>

                    <div className="prose prose-slate max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Acceptance of Terms</h2>
                            <p className="text-slate-600 leading-relaxed">
                                By accessing and using PdfWiser (pdfwiser.com), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Description of Service</h2>
                            <p className="text-slate-600 leading-relaxed">
                                PdfWiser provides free online PDF tools including but not limited to: Markdown to PDF conversion, PDF merging, PDF compression, image to PDF conversion, PDF to image conversion, and document conversion services. Our services are provided &quot;as is&quot; for personal and commercial use.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">User Responsibilities</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                By using our services, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-2">
                                <li>Use the services only for lawful purposes</li>
                                <li>Not upload, process, or distribute content that is illegal, harmful, or infringes on intellectual property rights</li>
                                <li>Not attempt to disrupt, damage, or overload our servers or infrastructure</li>
                                <li>Not use automated scripts or bots to access our services without permission</li>
                                <li>Ensure you have the right to process and convert any files you upload</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Intellectual Property</h2>
                            <p className="text-slate-600 leading-relaxed">
                                You retain all rights to the content you upload and the documents you generate using our services. PdfWiser does not claim ownership over your files or generated outputs. The PdfWiser brand, logo, website design, and original content are owned by PdfWiser and protected by intellectual property laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Disclaimer of Warranties</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We make no warranty regarding the quality, accuracy, or reliability of the results.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Limitation of Liability</h2>
                            <p className="text-slate-600 leading-relaxed">
                                To the fullest extent permitted by law, PdfWiser shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use or inability to use our services, even if we have been advised of the possibility of such damages.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Indemnification</h2>
                            <p className="text-slate-600 leading-relaxed">
                                You agree to indemnify and hold harmless PdfWiser, its owners, employees, and affiliates from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from your use of our services or violation of these Terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Service Modifications</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of our services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Privacy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Your use of our services is also governed by our Privacy Policy. By using PdfWiser, you consent to the collection and use of information as detailed in our Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Governing Law</h2>
                            <p className="text-slate-600 leading-relaxed">
                                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of our services shall be resolved in the appropriate courts.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Changes to Terms</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting on this page. Your continued use of our services after any changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                            <p className="text-slate-600 leading-relaxed">
                                If you have questions about these Terms of Service, please contact us through our website at pdfwiser.com.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}