"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    BarChart3, 
    Banknote, 
    Users, 
    MessageSquare, 
    Settings,
    Ghost,
    Gift
} from "lucide-react";

export default function AdminNav() {
    const pathname = usePathname();

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3, href: "/admin" },
        { id: "payouts", label: "Payouts", icon: Banknote, href: "/admin/payouts" },
        { id: "members", label: "Members", icon: Users, href: "/admin/members" },
        { id: "ghosts", label: "Ghosts", icon: Ghost, href: "/admin/ghosts" },
        { id: "chat", label: "Chat", icon: MessageSquare, href: "/admin/chat" },
        { id: "broadcasts", label: "Broadcasts", icon: Gift, href: "/admin/broadcasts" },
        { id: "settings", label: "Settings", icon: AdminSettingsIcon, href: "/admin/settings" }
    ];

    // Workaround for Lucide icon naming conflict or just use Settings
    function AdminSettingsIcon(props: any) {
        return <Settings {...props} />;
    }

    return (
        <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar py-0.5">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.id}
                        href={tab.href}
                        className={`flex items-center gap-1.5 px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-all relative shrink-0 whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                    >
                        <tab.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-primary' : ''}`} />
                        {tab.label}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
