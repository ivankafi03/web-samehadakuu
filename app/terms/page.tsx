import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Terms and conditions for using Samehadakuu.",
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-32">
            <h1 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase">Terms of Service</h1>
            
            <div className="prose prose-invert max-w-none space-y-8 text-zinc-400">
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Samehadakuu ("we", "us", or "our"), you agree to be bound by these Terms of Service 
                        and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
                        from using or accessing this site.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily view the materials on our website for personal, 
                        non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">3. Earning Program</h2>
                    <p>
                        Our earning program is subject to specific rules to prevent fraud and maintain system integrity:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>You must not use bots, scripts, or any automated methods to generate views.</li>
                        <li>Self-clicking or encouraging others to click solely for earning purposes is prohibited.</li>
                        <li>We reserve the right to suspend any account suspected of fraudulent activity without prior notice.</li>
                        <li>Payouts are processed after verification of traffic quality.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">4. Content Disclaimer</h2>
                    <p>
                        The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, 
                        and hereby disclaim and negate all other warranties including, without limitation, implied warranties or 
                        conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">5. Limitations</h2>
                    <p>
                        In no event shall Samehadakuu or its suppliers be liable for any damages (including, without limitation, 
                        damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                        to use the materials on our website.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">6. DMCA & Copyright</h2>
                    <p>
                        We respect the intellectual property rights of others. If you believe that any material available on or 
                        through the website infringes upon any copyright you own or control, please contact us immediately at 
                        support@samehadakuu.com.
                    </p>
                </section>

                <section className="pt-8 border-t border-white/5">
                    <p className="text-sm">Last updated: May 07, 2026</p>
                </section>
            </div>
        </div>
    );
}
