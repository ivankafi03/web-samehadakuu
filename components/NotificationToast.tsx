"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, Rocket, CheckCircle2, X } from "lucide-react";

export default function NotificationToast() {
    const { data: session } = useSession();
    const [notification, setNotification] = useState<any>(null);
    const [visible, setVisible] = useState(false);

    const fetchNotification = async () => {
        try {
            const res = await fetch("/api/ghosts/notifications");
            if (res.ok) {
                const data = await res.json();
                if (data.active) {
                    setNotification(data);
                    setVisible(true);
                    
                    // Hilang setelah 6 detik
                    setTimeout(() => {
                        setVisible(false);
                    }, 6000);
                }
            }
        } catch (e) {
            console.error("Notif fetch error", e);
        }
    };

    useEffect(() => {
        // Muncul pertama kali setelah 10 detik
        const initialDelay = setTimeout(() => {
            fetchNotification();
        }, 10000);

        // Muncul rutin setiap 3-7 menit (acak)
        const interval = setInterval(() => {
            const randomDelay = Math.floor(Math.random() * (420000 - 180000) + 180000);
            setTimeout(fetchNotification, randomDelay);
        }, 300000);

        return () => {
            clearTimeout(initialDelay);
            clearInterval(interval);
        };
    }, []);

    if (!notification || !visible) return null;

    const isGuest = !session;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] animate-in slide-in-from-left-full duration-700 ease-out">
            <div className="bg-[#0F0F11]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 max-w-[320px] relative overflow-hidden group">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-30 group-hover:opacity-50 transition-all blur-xl" />
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isGuest ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                    {isGuest ? <CheckCircle2 className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                </div>

                <div className="flex flex-col gap-0.5 z-10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                        {isGuest ? "Recent Withdrawal" : "Member Milestone"}
                    </p>
                    <h4 className="text-sm font-bold text-white leading-tight">
                        {notification.name}
                    </h4>
                    <p className="text-xs text-zinc-400">
                        {isGuest ? (
                            <>Telah mencairkan <span className="text-green-400 font-bold">${notification.amount}</span> ke {notification.method}</>
                        ) : (
                            <>Hampir mencapai target! Saldo saat ini <span className="text-primary font-bold">${notification.milestone}</span></>
                        )}
                    </p>
                </div>

                <button 
                    onClick={() => setVisible(false)}
                    className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-white transition-all"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
