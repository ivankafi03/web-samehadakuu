"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Gift, X, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "./ToastContext";

export default function RewardNotification() {
    const { data: session, status } = useSession();
    const [reward, setReward] = useState<any>(null);
    const [visible, setVisible] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [guestPromoVisible, setGuestPromoVisible] = useState(false);
    const { showToast } = useToast();

    const fetchRewards = async () => {
        if (status !== "authenticated") return;
        
        try {
            const res = await fetch("/api/member/rewards");
            if (res.ok) {
                const data = await res.json();
                if (data.rewards && data.rewards.length > 0) {
                    // Tampilkan reward pertama yang tersedia
                    setReward(data.rewards[0]);
                    setVisible(true);
                }
            }
        } catch (e) {
            console.error("Failed to fetch rewards", e);
        }
    };

    useEffect(() => {
        if (status === "authenticated") {
            // Cek reward setelah 3 detik login
            const timer = setTimeout(fetchRewards, 3000);
            return () => clearTimeout(timer);
        } else if (status === "unauthenticated") {
            // Tampilkan promo tamu setelah 8 detik
            const timer = setTimeout(() => {
                setGuestPromoVisible(true);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleClaim = async () => {
        if (!reward || claiming) return;
        
        setClaiming(true);
        try {
            const res = await fetch("/api/member/rewards/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId: reward.id })
            });

            if (res.ok) {
                showToast(`Sukses! Bonus $${reward.amount.toFixed(2)} ditambahkan ke saldo kamu.`, "success");
                setVisible(false);
                // Cek reward lain setelah 2 detik
                setTimeout(fetchRewards, 2000);
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal klaim bonus", "error");
            }
        } catch (e) {
            showToast("Gagal klaim, cek koneksi kamu", "error");
        } finally {
            setClaiming(false);
        }
    };

    // 1. Render Promo Tamu (Guest)
    if (guestPromoVisible && status === "unauthenticated") {
        return (
            <div className="fixed bottom-24 right-6 z-[9999] animate-in slide-in-from-right-full duration-700 ease-out">
                <div className="bg-[#0F0F11]/90 backdrop-blur-xl border border-primary/20 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(var(--primary-rgb),0.2)] flex flex-col gap-4 max-w-[280px] relative overflow-hidden group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-30 blur-xl group-hover:opacity-50 transition-all" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Special Offer</span>
                            <h4 className="text-sm font-bold text-white tracking-tight">Dapatkan $1.00 Gratis</h4>
                        </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed relative z-10">
                        Gabung jadi member sekarang dan klaim bonus pendaftaran pertamamu secara gratis!
                    </p>

                    <div className="flex items-center gap-2 relative z-10">
                        <Link 
                            href="/auth/login"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            Daftar Sekarang <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button 
                            onClick={() => setGuestPromoVisible(false)}
                            className="p-3 bg-white/5 hover:bg-white/10 text-zinc-500 rounded-xl transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Render Reward Member (Authenticated)
    if (!visible || !reward) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[9999] animate-in slide-in-from-right-full duration-700 ease-out">
            <div className="bg-[#0F0F11]/95 backdrop-blur-2xl border border-primary/30 p-6 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col gap-5 max-w-[300px] relative overflow-hidden group">
                {/* Animated Background Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />

                <div className="flex items-start justify-between relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-full w-fit">
                            <Gift className="w-3 h-3 text-primary" />
                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Claim Your Bonus</span>
                        </div>
                        <h4 className="text-lg font-black text-white tracking-tight mt-1 leading-tight">
                            {reward.title}
                        </h4>
                    </div>
                    <button 
                        onClick={() => setVisible(false)}
                        className="p-1.5 text-zinc-600 hover:text-white transition-all bg-white/5 rounded-full"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                            {reward.message}
                        </p>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-white hover:bg-zinc-200 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 active:scale-95"
                    >
                        {claiming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>Klaim Bonus ${reward.amount.toFixed(2)} <Sparkles className="w-4 h-4 text-primary" /></>
                        )}
                    </button>
                </div>

                {/* Corner Sparkle */}
                <Sparkles className="absolute top-4 right-4 w-12 h-12 text-primary/5 -rotate-12 pointer-events-none" />
            </div>
        </div>
    );
}
