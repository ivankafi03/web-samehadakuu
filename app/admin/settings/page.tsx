import React from "react";
import prisma from "@/lib/prisma";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
    const settings = await prisma.systemSettings.findFirst();
    const blockedIps = await prisma.blockedIp.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return <AdminSettingsClient initialSettings={settings} initialBlockedIps={blockedIps} />;
}
