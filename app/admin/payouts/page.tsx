import React from "react";
import prisma from "@/lib/prisma";
import AdminPayoutsClient from "@/components/admin/AdminPayoutsClient";

export default async function AdminPayoutsPage() {
    return <AdminPayoutsClient />;
}
