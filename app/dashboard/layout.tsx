import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Play, 
    Share2, 
    Trophy, 
    Banknote 
} from "lucide-react";
import NavTabs from "@/components/dashboard/NavTabs";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) as any;

    if (!session) {
        redirect("/login");
    }

    if (session.user?.role === "ADMIN") {
        redirect("/admin");
    }

    if (session.user?.role !== "MEMBER") {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) {
        redirect("/login");
    }

    if (user.isSuspended) {
        redirect("/auth/login?error=SUSPENDED");
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-6 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-lg font-semibold text-white tracking-tight">
                            Dashboard Member
                        </h1>
                        <p className="text-zinc-500 mt-0.5 text-sm">Pantau statistik dan pendapatanmu</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-zinc-400">Aktif</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <NavTabs />

                <div className="flex flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
