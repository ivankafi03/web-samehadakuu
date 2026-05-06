"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Play, 
    Share2, 
    Trophy, 
    Banknote 
} from "lucide-react";

export default function NavTabs() {
    const pathname = usePathname();

    const tabs = [
        { id: "overview", label: "Ringkasan", icon: LayoutDashboard, href: "/dashboard" },
        { id: "watch", label: "Nonton", icon: Play, href: "/dashboard/watch" },
        { id: "share", label: "Bagikan", icon: Share2, href: "/dashboard/share" },
        { id: "leaderboard", label: "Ranking", icon: Trophy, href: "/dashboard/leaderboard" },
        { id: "payouts", label: "Penarikan", icon: Banknote, href: "/dashboard/payouts" }
    ];

    return (
        <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative shrink-0 whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : ''}`} />
                        {tab.label}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
