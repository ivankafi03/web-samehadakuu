"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import WatchProgressIndicator from "./WatchProgressIndicator";
import { useSearchParams, usePathname } from "next/navigation";

interface WatchEarningManagerProps {
    videoId: string;
}

export default function WatchEarningManager({ videoId }: WatchEarningManagerProps) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [watchToken, setWatchToken] = useState<string | null>(null);

    // Request server-side watch token when component mounts (user clicked Play)
    useEffect(() => {
        if (!session || (session.user as any)?.role === "ADMIN") return;

        const requestToken = async () => {
            try {
                const res = await fetch("/api/earn/watch-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoId })
                });

                if (res.ok) {
                    const data = await res.json();
                    setWatchToken(data.token);
                }
            } catch (err) {
                console.error("Failed to get watch token", err);
            }
        };

        requestToken();
    }, [videoId, session]);

    // Handle referral tracking
    useEffect(() => {
        const ref = searchParams.get("ref");

        if (ref && videoId) {
            const userId = (session?.user as any)?.id;

            // Ignore self-referral
            if (userId && userId.substring(0, 8) === ref) {
                console.log("Self-referral ignored.");
                return;
            }

            const registerReferral = async () => {
                try {
                    await fetch("/api/views/referral", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ videoId, referrerId: ref })
                    });
                } catch (err) {
                    console.error("Failed to register referral view", err);
                }
            };

            registerReferral();
        }
    }, [searchParams, videoId, session]);

    if (!session || (session.user as any)?.role === "ADMIN") return null;

    return (
        <WatchProgressIndicator
            onComplete={() => {
                if (!watchToken) return; // no token = no reward (safety guard)

                fetch("/api/earn/watch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoId, token: watchToken })
                });
            }}
        />
    );
}
