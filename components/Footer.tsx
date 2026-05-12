"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Twitter, Instagram, Mail, Send, Video } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
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
                { name: "Videos", href: "/jav" },
                { name: "Categories", href: "/categories" },
                { name: "Popular", href: "/search?q=popular" },
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
                { name: "Contact", href: settings?.supportEmail ? `mailto:${settings.supportEmail}` : "mailto:support@cuanflix.site" },
            ],
        },
    ];

    return (
        <footer className="bg-background pt-16 pb-8 mt-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <Logo className="w-8 h-8 rounded-xl shadow-lg shadow-primary/20" />
                            <span className="text-white font-bold text-xl tracking-tight">
                                Cuan<span className="text-primary">flix</span>
                            </span>
                        </Link>
                        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6 font-medium">
                            The best place to explore premium videos while earning rewards. Join our community and start your journey today!
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
                        © {currentYear} Cuanflix. All rights reserved. Premium database.
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
