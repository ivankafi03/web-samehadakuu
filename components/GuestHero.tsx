import React from "react";
import Link from "next/link";
import { Play, DollarSign, Zap, ShieldCheck } from "lucide-react";

export default function GuestHero() {
    return (
        <div className="relative w-full rounded-[40px] overflow-hidden bg-white/5 border border-white/10 p-12 md:p-24 flex flex-col items-center text-center gap-8 shadow-2xl">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-dot-grid-sm opacity-20" />
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-widest relative z-10">
                <Zap className="w-3 h-3 fill-primary" />
                New: Watch to Earn is Live
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-white max-w-4xl leading-tight relative z-10">
                Nonton Anime <span className="text-primary">Dapat Saldo</span> Cuma Di Sini!
            </h1>

            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl relative z-10">
                Bergabunglah dengan ribuan member lainnya. Nonton anime favoritmu, bagikan link, dan cairkan pendapatanmu langsung ke Dana/OVO setiap hari.
            </p>

            <div className="flex flex-col md:flex-row gap-4 mt-4 relative z-10">
                <Link
                    href="/auth/login"
                    className="px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-lg"
                >
                    Start Earning Now
                </Link>
                <Link
                    href="/"
                    className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all text-lg flex items-center gap-2"
                >
                    <Play className="w-5 h-5 fill-white" />
                    Browse Anime
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-4xl relative z-10">
                {[
                    { label: "Nonton Sendiri", desc: "Dapatkan saldo tiap 60 detik", icon: Play },
                    { label: "Share & Earn", desc: "Komisi tiap ada yang klik linkmu", icon: DollarSign },
                    { label: "Withdraw Cepat", desc: "Minimal cuma $5 via E-Wallet", icon: ShieldCheck },
                ].map((feature, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-2">
                            <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="text-white font-bold text-sm">{feature.label}</h4>
                        <p className="text-zinc-500 text-xs">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
