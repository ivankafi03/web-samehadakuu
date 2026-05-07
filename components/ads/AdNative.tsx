"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// Native Banner Ad (container-based)
export default function AdNative({ className = "" }: { className?: string }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const isRestrictedPage = pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/auth");
    const isMemberOrAdmin = !!session?.user || isRestrictedPage;

    const containerRef = useRef<HTMLDivElement>(null);
    const loaded = useRef(false);

    useEffect(() => {
        if (!mounted || isMemberOrAdmin || loaded.current || !containerRef.current) return;
        loaded.current = true;

        const script = document.createElement("script");
        script.src = "https://pl29360873.profitablecpmratenetwork.com/cc6b63069d4fbfd8dc3934796f64530a/invoke.js";
        script.async = true;
        script.setAttribute("data-cfasync", "false");

        containerRef.current.appendChild(script);
    }, [isMemberOrAdmin, mounted]);

    return (!mounted || status === "loading" || isMemberOrAdmin) ? null : (
        <div className={`w-full overflow-hidden ${className}`}>
            <div id="container-cc6b63069d4fbfd8dc3934796f64530a" ref={containerRef} />
        </div>
    );
}
