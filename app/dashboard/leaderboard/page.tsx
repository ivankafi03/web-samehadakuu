import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LeaderboardClient from "@/components/dashboard/LeaderboardClient";

export default async function LeaderboardPage() {
    const session = await getServerSession(authOptions) as any;
    return <LeaderboardClient user={session?.user} />;
}
