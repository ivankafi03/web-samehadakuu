import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PayoutsClient from "@/components/dashboard/PayoutsClient";

export default async function PayoutsPage() {
    const session = await getServerSession(authOptions) as any;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            balanceWatch: true,
            balanceReferral: true,
            balanceBonus: true,
            name: true
        }
    });

    const settings = await prisma.systemSettings.findFirst() || { minWithdrawal: 50.00 };

    return <PayoutsClient user={user} settings={settings} />;
}
