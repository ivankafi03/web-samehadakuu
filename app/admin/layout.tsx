import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) as any;

    if (!session || session.user?.role !== "ADMIN") {
        redirect("/");
    }

    const settings = await prisma.systemSettings.findFirst();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 pt-20 md:pt-24 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Admin <span className="text-primary">Control</span>
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm">Panel administrasi dan manajemen sistem</p>
                </div>
                <div className="flex gap-3">
                    <div className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${settings?.maintenanceMode ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-500 shadow-lg shadow-red-500/5'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${settings?.maintenanceMode ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
                        {settings?.maintenanceMode ? 'Maintenance' : 'Live'}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <AdminNav />

            <div className="flex flex-col gap-6">
                {children}
            </div>
        </div>
    );
}
