"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type AdType = "leaderboard" | "rectangle" | "mobile";

interface AdUnitProps {
    type: AdType;
    className?: string;
}

const AD_CONFIG: Record<AdType, { key: string; width: number; height: number }> = {
    leaderboard: { key: "1dcbb1fb3684781e2c9a5588522d0ffc", width: 728, height: 90 },
    rectangle:   { key: "f16bab575f321c24cf6f7e82f039c85f", width: 300, height: 250 },
    mobile:      { key: "f09d108bbf23573dc096215b7e0a6ac8", width: 320, height: 50 },
};

export default function AdUnit({ type, className = "" }: AdUnitProps) {
    const pathname  = usePathname() || "";
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loaded       = useRef(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const config          = AD_CONFIG[type];
    const isRestricted    = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
    const shouldRender    = mounted && !isRestricted;

    // ── HOOK 2: inject ad script (runs only when shouldRender is true) ─
    useEffect(() => {
        if (!shouldRender || loaded.current || !containerRef.current) return;
        
        const updateAd = () => {
            if (!containerRef.current || loaded.current) return;
            
            const isMobile = window.innerWidth < 768;
            const finalKey = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.key : config.key;
            const finalWidth = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.width : config.width;
            const finalHeight = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.height : config.height;

            // USE IFRAME FOR ALL PLATFORMS - MUCH MORE RELIABLE
            containerRef.current.innerHTML = `<iframe src="https://www.highperformanceformat.com/${finalKey}/watch.html" width="${finalWidth}" height="${finalHeight}" frameborder="0" scrolling="no" style="display:block;margin:0 auto;max-width:100%;"></iframe>`;
            loaded.current = true;
        };

        // Run once on mount
        updateAd();
    }, [shouldRender, config.key, config.height, config.width, type, pathname]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!shouldRender) return null;

    const isMobile = mounted && window.innerWidth < 768;
    const finalWidth = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.width : config.width;
    const finalHeight = (type === "leaderboard" && isMobile) ? AD_CONFIG.mobile.height : config.height;

    return (
        <div
            className={`overflow-hidden flex items-center justify-center mx-auto ${className}`}
            style={{ 
                maxWidth: "100%", 
                width: finalWidth,
                minHeight: finalHeight,
                height: "auto"
            }}
        >
            <div ref={containerRef} className="w-full flex justify-center" />
        </div>
    );
}
