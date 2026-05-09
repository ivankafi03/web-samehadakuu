"use client";

import React, { useState } from "react";
import { 
    Settings, 
    Power, 
    Save, 
    Loader2, 
    ShieldOff, 
    History, 
    Trash2, 
    ShieldCheck,
    Hammer,
    AlertCircle,
    Send,
    Instagram,
    Twitter,
    Video,
    Mail
} from "lucide-react";
import { useToast } from "../ToastContext";

export default function AdminSettingsClient({ initialSettings, initialBlockedIps }: { initialSettings: any, initialBlockedIps: any[] }) {
    const [settings, setSettings] = useState(initialSettings || {
        cpmRate: 1.50,
        skimRate: 0.20,
        watchRate: 0.005,
        minWithdrawal: 50.00,
        registrationBonus: 0.10,
        welcomeBonus: 1.00,
        maintenanceMode: false,
        maintenanceMessage: "System is undergoing maintenance.",
        telegramLink: initialSettings?.telegramLink || "",
        xLink: initialSettings?.xLink || "",
        instagramLink: initialSettings?.instagramLink || "",
        tiktokLink: initialSettings?.tiktokLink || "",
        supportEmail: initialSettings?.supportEmail || ""
    });
    const [blockedIps, setBlockedIps] = useState(initialBlockedIps);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...settings,
                // Pastikan registrationBonus selalu terkirim meski tidak ada di form
                registrationBonus: settings.registrationBonus ?? 0.10,
                welcomeBonus: settings.welcomeBonus ?? 1.00,
            };
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast("Settings saved successfully!", "success");
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(`Failed: ${err?.error || res.statusText}`, "error");
            }
        } catch (err) {
            showToast("Network error — check your connection", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUnblock = async (ip: string) => {
        try {
            const res = await fetch('/api/admin/blocked-ips', { 
                method: 'DELETE', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ ip }) 
            });
            if (res.ok) {
                setBlockedIps(prev => prev.filter(b => b.ip !== ip));
                showToast(`Access restored for IP ${ip}`, "success");
            }
        } catch (e) {
            showToast("Restoration failed", "error");
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">System <span className="text-primary">Architecture</span></h2>
                <p className="text-sm text-zinc-500 font-medium">Global Rates, Security Protocols & Access Control.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="flex flex-col gap-8">
                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-batik-modern opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-all" />
                        
                        <div className="flex items-center gap-4 z-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/10">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">Global Revenue Logic</h3>
                        </div>

                        <div className="space-y-10 z-10">
                             {/* Maintenance Toggle */}
                             <div className={`p-6 rounded-[1.8rem] border transition-all ${settings.maintenanceMode ? 'bg-orange-500/10 border-orange-500/20 shadow-xl shadow-orange-500/5' : 'bg-black/40 border-white/5'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings.maintenanceMode ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {settings.maintenanceMode ? <Hammer className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                                        </div>
                                         <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-white">Emergency Maintenance</span>
                                            <span className={`text-sm font-medium ${settings.maintenanceMode ? 'text-orange-500' : 'text-zinc-600'}`}>{settings.maintenanceMode ? 'System Locked' : 'Normal Operation'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.maintenanceMode ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'bg-zinc-800'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-xl ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </div>
                                {settings.maintenanceMode && (
                                    <textarea
                                        value={settings.maintenanceMessage}
                                        onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm font-medium text-orange-500 focus:outline-none focus:border-orange-500/50 min-h-[120px] resize-none"
                                        placeholder="System Alert Message..."
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                {/* CPM */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm font-bold text-zinc-600 ">Network CPM</span>
                                        <span className="text-2xl font-bold text-primary tracking-tighter">${settings.cpmRate.toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range" min="0.1" max="10" step="0.1"
                                        value={settings.cpmRate}
                                        onChange={(e) => setSettings({ ...settings, cpmRate: parseFloat(e.target.value) })}
                                        className="w-full accent-primary bg-zinc-800 h-1.5 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Skim */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm font-bold text-zinc-600 ">Revenue Skim</span>
                                        <span className="text-2xl font-bold text-red-500 tracking-tighter">{Math.round(settings.skimRate * 100)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="1" step="0.05"
                                        value={settings.skimRate}
                                        onChange={(e) => setSettings({ ...settings, skimRate: parseFloat(e.target.value) })}
                                        className="w-full accent-red-500 bg-zinc-800 h-1.5 rounded-full appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Watch Yield (Min)</span>
                                    <input
                                        type="number" step="0.0001"
                                        value={settings.watchRate}
                                        onChange={(e) => setSettings({ ...settings, watchRate: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Threshold (USD)</span>
                                    <input
                                        type="number" step="1"
                                        value={settings.minWithdrawal}
                                        onChange={(e) => setSettings({ ...settings, minWithdrawal: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Referral Bonus (USD)</span>
                                    <input
                                        type="number" step="0.01"
                                        value={settings.registrationBonus}
                                        onChange={(e) => setSettings({ ...settings, registrationBonus: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Welcome Bonus (USD)</span>
                                    <input
                                        type="number" step="0.01"
                                        value={settings.welcomeBonus}
                                        onChange={(e) => setSettings({ ...settings, welcomeBonus: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40"
                                    />
                                </div>
                            </div>

                            {/* Telegram Link */}
                            <div className="flex flex-col gap-3">
                                <span className="text-sm font-bold text-zinc-600 ">Telegram Community Link</span>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                                        <Send className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.telegramLink || ""}
                                        onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })}
                                        placeholder="https://t.me/your_group"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-600 font-medium px-2 italic">* This link will appear in the footer and member dashboard.</p>
                            </div>

                            {/* Social Media Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">X (Twitter) Link</span>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                                            <Twitter className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.xLink || ""}
                                            onChange={(e) => setSettings({ ...settings, xLink: e.target.value })}
                                            placeholder="https://x.com/your_handle"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Instagram Link</span>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.instagramLink || ""}
                                            onChange={(e) => setSettings({ ...settings, instagramLink: e.target.value })}
                                            placeholder="https://instagram.com/your_handle"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">TikTok Link</span>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.tiktokLink || ""}
                                            onChange={(e) => setSettings({ ...settings, tiktokLink: e.target.value })}
                                            placeholder="https://tiktok.com/@your_handle"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-zinc-600 ">Support Email</span>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-primary transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.supportEmail || ""}
                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                            placeholder="support@yourdomain.com"
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-white tracking-tight focus:outline-none focus:border-primary/40 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-5 bg-white text-black font-bold text-sm rounded-2xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl shadow-white/10"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Synchronizing..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Security Sidebar */}
                <div className="flex flex-col gap-8">
                    <div className="bg-[#0F0F11] border border-red-500/10 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-batik-modern opacity-[0.03] pointer-events-none" />
                        <div className="flex items-center justify-between z-10">
                            <h3 className="text-[10px] font-bold text-white  flex items-center gap-3">
                                <ShieldOff className="w-5 h-5 text-red-500" />
                                Restricted Access Nodes
                            </h3>
                            <button className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-zinc-600 transition-all">
                                <History className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 z-10 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
                            {blockedIps.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4 opacity-20 text-center">
                                    <ShieldCheck className="w-12 h-12 text-green-500" />
                                    <p className="text-[10px] font-bold  leading-relaxed">Network Perimeter Secure. <br /> No active IP blocks found.</p>
                                </div>
                            ) : (
                                blockedIps.map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-5 bg-red-500/5 border border-red-500/10 rounded-[1.8rem] group hover:bg-red-500/10 transition-all">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <span className="text-[11px] font-bold text-red-500 font-mono tracking-tight">{entry.ip}</span>
                                            <span className="text-sm font-bold text-zinc-600  truncate">{entry.reason || 'POLICY VIOLATION'}</span>
                                            <span className="text-[11px] font-bold text-zinc-800  mt-1">{new Date(entry.createdAt).toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleUnblock(entry.ip)}
                                            className="p-3 bg-white/5 rounded-xl hover:bg-red-500 text-zinc-500 hover:text-white transition-all shadow-inner"
                                            title="Restore Access"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-[#0F0F11] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                         <div className="flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                            <h3 className="text-[10px] font-bold text-white ">Protocol Intelligence</h3>
                         </div>
                         <p className="text-sm text-zinc-500 font-bold leading-relaxed ">All changes to rates will be recorded in the audit log. The system will automatically stop payment distributions if the skim rate is set above 80%.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
