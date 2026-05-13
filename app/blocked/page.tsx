import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Access Blocked - Samehadakuu",
    robots: { index: false, follow: false }
};

export default function BlockedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full flex flex-col items-center gap-6 text-center">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-3">
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Access Blocked
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Your IP address has been blocked from accessing this platform for violating our terms of service.
                    </p>
                    <p className="text-zinc-600 text-xs">
                        If you believe this is a mistake, please contact the administrator.
                    </p>
                </div>

                {/* Code block */}
                <div className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Error Code</span>
                    <span className="text-red-500 font-mono font-bold text-sm">403 — IP_BANNED</span>
                </div>
            </div>
        </div>
    );
}
