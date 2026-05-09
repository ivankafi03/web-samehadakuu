import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OverviewClient from "@/components/dashboard/OverviewClient";

export default async function OverviewPage() {
    const session = await getServerSession(authOptions) as any;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            balanceWatch: true,
            balanceReferral: true,
            balanceBonus: true,
            registrationBonusClaimed: true,
        }
    });

    return <OverviewClient user={user} />;
}
