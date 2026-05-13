"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdNative({ className = "" }: { className?: string }) {
    const pathname  = usePathname() || "";
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loaded       = useRef(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
    const shouldRender = mounted && !isRestricted;

    // ── HOOK 2: inject native ad script ─────────────────────────────
    useEffect(() => {
        if (!shouldRender || loaded.current || !containerRef.current) return;
        loaded.current = true;

        const script = document.createElement("script");
        script.src   = "https://pl29360873.profitablecpmratenetwork.com/cc6b63069d4fbfd8dc3934796f64530a/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        containerRef.current.appendChild(script);
    }, [shouldRender]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!shouldRender) return null;

    return (
        <div className={`w-full flex justify-center py-4 sm:py-8 overflow-hidden relative ${className}`}>
            <div 
                className="w-full flex justify-center items-center"
                style={{
                    marginLeft: 'calc(50% - 50vw)',
                    marginRight: 'calc(50% - 50vw)',
                    width: '100vw',
                    maxWidth: '100vw',
                }}
            >
                <div 
                    id="container-cc6b63069d4fbfd8dc3934796f64530a" 
                    ref={containerRef} 
                    className="flex justify-center items-center ad-container-responsive"
                    style={{
                        minWidth: '320px',
                        transformOrigin: 'center center',
                    }}
                />
            </div>

            <style jsx global>{`
                .ad-container-responsive {
                    width: 100% !important;
                    max-width: 100vw !important;
                    overflow: visible !important;
                }

                #container-cc6b63069d4fbfd8dc3934796f64530a > div {
                    margin: 0 auto !important;
                }

                /* Agresif scaling untuk HP kecil agar tidak terpotong */
                @media (max-width: 400px) {
                    .ad-container-responsive {
                        transform: scale(0.95);
                    }
                }
                @media (max-width: 360px) {
                    .ad-container-responsive {
                        transform: scale(0.85);
                    }
                }
            `}</style>
        </div>
    );
}
