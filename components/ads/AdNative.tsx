"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Native Banner Ad (container-based)
export default function AdNative({ className = "" }: { className?: string }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";

    // Keamanan ekstra: Matikan jika di halaman admin/dashboard
    const isRestrictedPage = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth");

    const containerRef = useRef<HTMLDivElement>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (isAdmin || isRestrictedPage || loaded.current || !containerRef.current) return;
        loaded.current = true;

        const script = document.createElement("script");
        script.src = "https://pl29360873.profitablecpmratenetwork.com/cc6b63069d4fbfd8dc3934796f64530a/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");

        containerRef.current.appendChild(script);
    }, []);

    return (isAdmin || isRestrictedPage) ? null : (
        <div className={`w-full overflow-hidden ${className}`}>
            <div id="container-cc6b63069d4fbfd8dc3934796f64530a" ref={containerRef} />
        </div>
    );
}
