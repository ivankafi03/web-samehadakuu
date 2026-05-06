import React from "react";

export default function Loading() {
    return (
        <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-4">
                <div className="h-10 w-64 bg-white/5 animate-pulse rounded-xl" />
                <div className="h-4 w-96 bg-white/5 animate-pulse rounded-lg" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="aspect-[2/3] bg-white/5 animate-pulse rounded-2xl" />
                        <div className="h-4 w-full bg-white/5 animate-pulse rounded-lg" />
                        <div className="h-4 w-2/3 bg-white/5 animate-pulse rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}
