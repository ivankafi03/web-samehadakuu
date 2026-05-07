"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";

export default function AdScripts() {
    const pathname  = usePathname() || "";
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

    // ── HOOK 2: toggle body class and cleanup ads ────────────────────
    useEffect(() => {
        if (!mounted) return;
        
        if (isRestricted) {
            document.body.classList.add("admin-page");
            
            // Aggressive Cleanup: Nuke all known ad scripts and elements
            const cleanup = () => {
                const adScripts = document.querySelectorAll('script[src*="profitablecpm"], script[src*="quge5"], script[src*="highperformance"], script[id*="adsterra"], script[id*="monetag"]');
                adScripts.forEach(s => s.remove());
                
                const adElements = document.querySelectorAll('[id*="container-"], [class*="ad-"], [class*="banner"], iframe[src*="profitablecpm"], iframe[src*="highperformance"], iframe[src*="quge5"]');
                adElements.forEach(el => {
                    (el as HTMLElement).style.display = 'none';
                    (el as HTMLElement).style.setProperty('display', 'none', 'important');
                    el.remove();
                });
            };

            cleanup();
            const interval = setInterval(cleanup, 1000); // Continuous cleanup
            return () => clearInterval(interval);
        } else {
            document.body.classList.remove("admin-page");
        }
    }, [mounted, isRestricted, pathname]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!mounted || status === "loading") return null;

    // Jika member login, matikan iklan Popunder/Pop-up (Script-level)
    const isMember = !!session?.user;
    
    // Guardian tetap render null di restricted page untuk scripts
    if (isRestricted) return null;

    return (
        <>
            {/* AdsTerra Popunder */}
            <Script
                id="adsterra-popunder"
                src="https://pl29360872.profitablecpmratenetwork.com/a6/20/66/a620661409a43f241ad7455bce5763f5.js"
                strategy="lazyOnload"
            />
            {/* AdsTerra Social Bar */}
            <Script
                id="adsterra-social-bar"
                src="https://pl29361005.profitablecpmratenetwork.com/6c/42/86/6c42861347614d9396e6d78701918386.js"
                strategy="lazyOnload"
            />
            {/* Monetag MultiTag - Disabled for cleaner experience
            <Script
                id="monetag-multitag"
                src="https://quge5.com/88/tag.min.js"
                data-zone="237063"
                strategy="lazyOnload"
                data-cfasync="false"
            />
            */}
            {/* Histats Tracker */}
            <Script id="histats-tracker" strategy="lazyOnload">{`
                var _Hasync = _Hasync || [];
                _Hasync.push(['Histats.start', '1, 5025180, 4, 0, 0, 0, 00010000']);
                _Hasync.push(['Histats.fasi', '1']);
                _Hasync.push(['Histats.track_hits', '']);
                (function() {
                    var hs = document.createElement('script');
                    hs.type = 'text/javascript'; hs.async = true;
                    hs.src = '//s10.histats.com/js15_as.js';
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
                })();
            `}</Script>
        </>
    );
}
