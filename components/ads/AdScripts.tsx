"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";

export default function AdScripts() {
    const pathname  = usePathname() || "";
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    // ── HOOK 1: set mounted ──────────────────────────────────────────
    useEffect(() => { setMounted(true); }, []);

    const isRestricted = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

    // ── HOOK 2: toggle body class and cleanup ads ────────────────────
    useEffect(() => {
        if (!mounted) return;
        if (isRestricted) {
            document.body.classList.add("admin-page");
            
            // Aggressive Cleanup: Nuke all known ad scripts from DOM
            const adScripts = document.querySelectorAll('script[src*="profitablecpm"], script[src*="quge5"], script[src*="highperformance"], script[id*="adsterra"], script[id*="monetag"]');
            adScripts.forEach(s => s.remove());
            
            // Hide all ad containers
            const adContainers = document.querySelectorAll('[id*="container-"], [class*="ad-"], [class*="banner"]');
            adContainers.forEach(c => {
                (c as HTMLElement).style.display = 'none';
                (c as HTMLElement).style.visibility = 'hidden';
                (c as HTMLElement).style.height = '0';
            });
        } else {
            document.body.classList.remove("admin-page");
        }
    }, [mounted, isRestricted]);

    // ── Conditional render AFTER all hooks ───────────────────────────
    if (!mounted || isRestricted) return null;

    // Jika member login, matikan iklan Popunder/Pop-up agar navigasi lancar
    // Tapi iklan Banner (AdUnit/AdNative) tetap muncul di halaman depan
    const isMember = !!session?.user;
    if (isMember) return null;

    return (
        <>
            {/* AdsTerra Popunder */}
            <Script
                id="adsterra-popunder"
                src="https://pl29360872.profitablecpmratenetwork.com/a6/20/66/a620661409a43f241ad7455bce5763f5.js"
                strategy="lazyOnload"
            />
            {/* Monetag MultiTag */}
            <Script
                id="monetag-multitag"
                src="https://quge5.com/88/tag.min.js"
                data-zone="237063"
                strategy="lazyOnload"
                data-cfasync="false"
            />
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
