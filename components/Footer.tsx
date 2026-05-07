"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Twitter, Instagram, Mail, Send, Video } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(() => {});
    }, []);

    const sections = [
        {
            title: "Navigation",
            links: [
                { name: "Home", href: "/" },
                { name: "Anime List", href: "/anime" },
                { name: "Ongoing", href: "/anime/ongoing" },
                { name: "Popular", href: "/anime/popular" },
            ],
        },
        {
            title: "Member Area",
            links: [
                { name: "Dashboard", href: "/dashboard" },
                { name: "Watchlist", href: "/watchlist" },
                { name: "Affiliate Program", href: "/dashboard" },
                { name: "Leaderboard", href: "/dashboard/leaderboard" },
            ],
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "DMCA", href: "/terms" },
                { name: "Contact", href: settings?.supportEmail ? `mailto:${settings.supportEmail}` : "mailto:support@samehadakuu.com" },
            ],
        },
    ];

    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-16 pb-8 mt-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <Logo size="md" />
                        </Link>
                        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6 font-medium">
                            The best place to watch anime while earning money. Join our community and start your journey today!
                        </p>
                        <div className="flex gap-4">
                            {settings?.xLink && (
                                <a href={settings.xLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all border border-white/5" title="X (Twitter)">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.instagramLink && (
                                <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all border border-white/5" title="Instagram">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.telegramLink && (
                                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all border border-white/5" title="Telegram">
                                    <Send className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.tiktokLink && (
                                <a href={settings.tiktokLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all border border-white/5" title="TikTok">
                                    <Video className="w-5 h-5" />
                                </a>
                            )}
                            {settings?.supportEmail && (
                                <a href={`mailto:${settings.supportEmail}`} className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg transition-all border border-white/5" title="Email Support">
                                    <Mail className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map((section) => (
                        <div key={section.title} className="col-span-1">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <Link 
                                            href={link.href} 
                                            className="text-zinc-500 hover:text-primary text-sm transition-colors font-medium"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-zinc-600 text-xs font-medium">
                        © {currentYear} Samehadakuu. All rights reserved. Built for anime fans.
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
