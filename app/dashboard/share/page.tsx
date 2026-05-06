import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ShareClient from "@/components/dashboard/ShareClient";

export default async function SharePage() {
    const session = await getServerSession(authOptions) as any;
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            balanceReferral: true,
        }
    });

    return <ShareClient user={user} />;
}
