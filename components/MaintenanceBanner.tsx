"use client";

import React, { useState, useEffect, useRef } from "react";
import { Hammer, X, AlertTriangle } from "lucide-react";

export default function MaintenanceBanner() {
    const [settings, setSettings] = useState<any>(null);
    const [dismissed, setDismissed] = useState(false);
    const prevMode = useRef<boolean | null>(null);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/admin/settings?t=${Date.now()}`, {
                cache: "no-store",
            });
            if (res.ok) {
                const data = await res.json();

                // Jika maintenance BARU dinyalakan (sebelumnya off), reset dismiss state
                if (prevMode.current === false && data.maintenanceMode === true) {
                    setDismissed(false);
                }
                prevMode.current = data.maintenanceMode;
                setSettings(data);
            }
        } catch (err) {
            // Silently handle fetch failures during unmount/logout
        }
    };

    useEffect(() => {
        fetchSettings();
        // Polling dimatikan sementara untuk stop log spam
        // const interval = setInterval(fetchSettings, 30000);
        // return () => clearInterval(interval);
    }, []);

    if (!settings?.maintenanceMode || dismissed) return null;

    return (
        <div
            className="w-full z-[150] px-3 sm:px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 animate-in slide-in-from-top duration-300"
            role="alert"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                        <Hammer className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider shrink-0">
                            Maintenance Mode
                        </span>
                        <span className="hidden sm:block text-zinc-600 text-xs">·</span>
                        <p className="text-xs text-white/70 truncate">
                            {settings.maintenanceMessage || "Situs sedang dalam pemeliharaan. Mohon tunggu."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors shrink-0"
                    aria-label="Tutup"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
