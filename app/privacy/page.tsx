import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Privacy policy for Samehadakuu - Learn how we handle your data.",
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-32">
            <h1 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase">Privacy Policy</h1>
            
            <div className="prose prose-invert max-w-none space-y-8 text-zinc-400">
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
                    <p>
                        Welcome to Samehadakuu. We are committed to protecting your personal information and your right to privacy. 
                        If you have any questions or concerns about our policy, or our practices with regards to your personal information, 
                        please contact us at support@samehadakuu.com.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
                    <p>
                        We collect personal information that you voluntarily provide to us when registering at the website, 
                        expressing an interest in obtaining information about us or our products and services, when participating 
                        in activities on the website or otherwise contacting us.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Personal Information Provided by You: We collect names; email addresses; usernames; passwords; and other similar information.</li>
                        <li>Information automatically collected: We automatically collect certain information when you visit, use or navigate the website, such as IP address and browser characteristics.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our website for a variety of business purposes described below. 
                        We process your personal information for these purposes in reliance on our legitimate business interests, 
                        in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">4. Sharing Your Information</h2>
                    <p>
                        We only share information with your consent, to comply with laws, to provide you with services, 
                        to protect your rights, or to fulfill business obligations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">5. Cookies and Tracking Technologies</h2>
                    <p>
                        We may use cookies and similar tracking technologies to access or store information. 
                        Specific information about how we use such technologies and how you can refuse certain cookies 
                        is set out in our Cookie Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-4">6. Security of Your Information</h2>
                    <p>
                        We aim to protect your personal information through a system of organizational and technical security measures. 
                        However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                    </p>
                </section>

                <section className="pt-8 border-t border-white/5">
                    <p className="text-sm">Last updated: May 07, 2026</p>
                </section>
            </div>
        </div>
    );
}
