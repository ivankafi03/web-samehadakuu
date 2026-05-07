"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play, Shield } from "lucide-react";

const DIRECT_LINK = "https://www.profitablecpmratenetwork.com/xzgfq5xkc8?key=55406436bb6e7d868ad1a2c1d9a3f4fc";

function openAd() {
    try { window.open(DIRECT_LINK, "_blank"); } catch (_) {}
}

export default function GoRedirectClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const destination = searchParams.get("to") || "/";
    const [countdown, setCountdown] = useState(10);
    const [canSkip, setCanSkip] = useState(false);
    const adRef1 = useRef<HTMLDivElement>(null);
    const adRef2 = useRef<HTMLDivElement>(null);
    const adsLoaded = useRef(false);

    // Klik 1 sudah terjadi (user mengklik episode) → buka Direct Link otomatis saat halaman ini dimuat
    useEffect(() => {
        openAd();
    }, []);

    // Load AdsTerra banner ads
    useEffect(() => {
        if (adsLoaded.current) return;
        adsLoaded.current = true;

        if (adRef1.current) {
            (window as any).atOptions = {
                key: "1dcbb1fb3684781e2c9a5588522d0ffc",
                format: "iframe", height: 90, width: 728, params: {},
            };
            const s1 = document.createElement("script");
            s1.src = "https://www.highperformanceformat.com/1dcbb1fb3684781e2c9a5588522d0ffc/invoke.js";
            s1.async = true;
            adRef1.current.appendChild(s1);
        }

        if (adRef2.current) {
            (window as any).atOptions = {
                key: "f16bab575f321c24cf6f7e82f039c85f",
                format: "iframe", height: 250, width: 300, params: {},
            };
            const s2 = document.createElement("script");
            s2.src = "https://www.highperformanceformat.com/f16bab575f321c24cf6f7e82f039c85f/invoke.js";
            s2.async = true;
            adRef2.current.appendChild(s2);
        }
    }, []);

    // Countdown
    useEffect(() => {
        if (countdown <= 0) { setCanSkip(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // Auto redirect after 15 detik
    useEffect(() => {
        const t = setTimeout(() => router.push(destination), 15000);
        return () => clearTimeout(t);
    }, [destination, router]);

    // Klik 2: user klik "Lanjutkan" → buka Direct Link lagi + navigasi ke video
    const handleContinue = () => {
        if (!canSkip) return;
        openAd();
        router.push(destination);
    };

    return (
        <div className="min-h-screen bg-[#0c0c0e] flex flex-col items-center justify-center px-4 py-10 gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Mengarahkan ke video dalam</span>
                </div>

                {/* Ring countdown */}
                <div className="relative w-20 h-20 my-2">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#ffffff08" strokeWidth="5" />
                        <circle
                            cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (countdown / 10)}`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white text-2xl font-black leading-none">{countdown > 0 ? countdown : "✓"}</span>
                        <span className="text-zinc-600 text-[9px] mt-0.5">detik</span>
                    </div>
                </div>
            </div>

            {/* Leaderboard Ad — desktop */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50">
                <p className="text-zinc-700 text-[9px] uppercase tracking-widest text-center pt-2">Sponsor</p>
                <div ref={adRef1} className="flex items-center justify-center min-w-[728px] min-h-[90px]" />
            </div>

            {/* Rectangle Ad */}
            <div className="overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50">
                <p className="text-zinc-700 text-[9px] uppercase tracking-widest text-center pt-2">Sponsor</p>
                <div ref={adRef2} className="flex items-center justify-center min-w-[300px] min-h-[250px]" />
            </div>

            {/* Tombol Lanjutkan (Klik 2) */}
            <button
                onClick={handleContinue}
                disabled={!canSkip}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                    canSkip
                        ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-pointer"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
            >
                <Play className="w-4 h-4 fill-current" />
                {canSkip ? "Lanjutkan ke Video" : `Tunggu ${countdown} detik...`}
            </button>

            <p className="text-zinc-700 text-xs text-center">
                Akan otomatis diarahkan dalam beberapa detik.
            </p>
        </div>
    );
}
