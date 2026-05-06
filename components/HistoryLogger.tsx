"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface HistoryLoggerProps {
    videoId: string;
    videoTitle: string;
    videoImage: string;
    videoUrl: string;
}

export default function HistoryLogger({ videoId, videoTitle, videoImage, videoUrl }: HistoryLoggerProps) {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session) return;

        const logHistory = async () => {
            try {
                await fetch("/api/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    cache: 'no-store',
                    body: JSON.stringify({
                        videoId,
                        videoTitle,
                        videoImage,
                        videoUrl
                    })
                });
            } catch (error) {
                console.error("Failed to log watch history:", error);
            }
        };

        logHistory();
    }, [session, videoId, videoTitle, videoImage, videoUrl]);

    return null;
}
