import React from "react";

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-pulse">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col gap-2">
                    <div className="h-8 w-48 bg-white/5 rounded-lg" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl" />
                ))}
            </div>
            
            <div className="h-64 bg-white/5 rounded-2xl" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-96 bg-white/5 rounded-2xl" />
                <div className="h-96 bg-white/5 rounded-2xl" />
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-[#0F0F11] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                    <div className="h-3 w-1/4 bg-white/5 rounded-lg" />
                </div>
            </div>
            <div className="h-32 w-full bg-white/5 rounded-xl mt-2" />
        </div>
    );
}
