import React from "react";
import prisma from "@/lib/prisma";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export default async function AdminOverviewPage() {
    const memberCount = await prisma.user.count({ where: { role: 'MEMBER' } });
    
    return <AdminOverviewClient initialData={{ memberCount }} />;
}
