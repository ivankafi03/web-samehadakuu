"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AdScripts() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Jika user sudah login (Member atau Admin), anggap sebagai "Premium" dan matikan iklan
    const isMemberOrAdmin = !!session?.user;

    // Daftar halaman yang TIDAK boleh ada iklan
    const hideAdsOn = [
        "/auth",
        "/api/auth",
        "/admin",
        "/dashboard"
    ];

    // Cek apakah halaman sekarang masuk dalam daftar hitam iklan
    const isAuthPage = hideAdsOn.some(path => pathname.startsWith(path));

    // Keamanan brutal: Jika di halaman terlarang, paksa hapus semua sisa-sisa iklan dari DOM
    useEffect(() => {
        if (!mounted) return;

        if (isMemberOrAdmin || isAuthPage) {
            // Tambahkan class admin-page ke body untuk mengaktifkan CSS Nuklir
            document.body.classList.add('admin-page');

            // Hapus script-script iklan jika ada yang tersisa
            const adScripts = document.querySelectorAll('script[src*="profitablecpm"], script[src*="quge5"], script[src*="highperformance"]');
            adScripts.forEach(s => s.remove());

            // Hapus container iklan jika ada
            const adContainers = document.querySelectorAll('[id*="container-"], [class*="ad-"]');
            adContainers.forEach(c => (c as HTMLElement).style.display = 'none');
            
            // Hapus Histats jika ada
            const histats = document.querySelectorAll('script[src*="histats"]');
            histats.forEach(h => h.remove());
        } else {
            // Hapus class admin-page jika sudah di halaman biasa agar iklan pengunjung muncul lagi
            document.body.classList.remove('admin-page');
        }
    }, [pathname, isMemberOrAdmin, isAuthPage, mounted]);

    // Jika belum mounted, masih loading session, atau user adalah member/admin, jangan tampilkan apa-apa
    if (!mounted || status === "loading" || isMemberOrAdmin || isAuthPage) return null;

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

