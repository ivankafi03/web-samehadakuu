"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

type AdType = "leaderboard" | "rectangle" | "mobile";

interface AdUnitProps {
    type: AdType;
    className?: string;
}

const AD_CONFIG: Record<AdType, { key: string; width: number; height: number }> = {
    leaderboard: {
        key: "1dcbb1fb3684781e2c9a5588522d0ffc",
        width: 728,
        height: 90,
    },
    rectangle: {
        key: "f16bab575f321c24cf6f7e82f039c85f",
        width: 300,
        height: 250,
    },
    mobile: {
        key: "f09d108bbf23573dc096215b7e0a6ac8",
        width: 320,
        height: 50,
    },
};

export default function AdUnit({ type, className = "" }: AdUnitProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const isMemberOrAdmin = !!session?.user;
    
    // Keamanan ekstra: Matikan jika di halaman admin/dashboard
    const isRestrictedPage = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth");
    
    if (!mounted || status === "loading" || isMemberOrAdmin || isRestrictedPage) return null;

    const containerRef = useRef<HTMLDivElement>(null);
    const loaded = useRef(false);

    const config = AD_CONFIG[type];

    useEffect(() => {
        if (isMemberOrAdmin || loaded.current || !containerRef.current) return;
        loaded.current = true;

        // Set atOptions
        (window as any).atOptions = {
            key: config.key,
            format: "iframe",
            height: config.height,
            width: config.width,
            params: {},
        };

        // Inject script
        const script = document.createElement("script");
        script.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`;
        script.async = true;
        containerRef.current.appendChild(script);
    }, [config.key, config.height, config.width]);

    return isMemberOrAdmin ? null : (
        <div
            className={`overflow-hidden flex items-center justify-center ${className}`}
            style={{ minWidth: config.width, minHeight: config.height }}
        >
            <div ref={containerRef} />
        </div>
    );
}
