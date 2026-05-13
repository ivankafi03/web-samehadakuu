import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-col gap-8 pb-20 pt-24 min-h-screen bg-black">
            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8 animate-pulse">
                {/* Poster & Title Skeleton */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-64 aspect-[3/4] bg-zinc-900 rounded-3xl" />
                    <div className="flex-1 flex flex-col gap-4 w-full">
                        <div className="h-10 w-3/4 bg-zinc-900 rounded-xl" />
                        <div className="h-6 w-1/4 bg-zinc-800 rounded-lg" />
                        <div className="flex gap-2 mt-4">
                            <div className="h-8 w-20 bg-zinc-900 rounded-full" />
                            <div className="h-8 w-20 bg-zinc-900 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Video Player Skeleton */}
                <div className="w-full aspect-video bg-zinc-900 rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white/20 border-b-[15px] border-b-transparent ml-2" />
                    </div>
                </div>

                {/* Server Selection Skeleton */}
                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 w-32 bg-zinc-900 rounded-2xl" />
                    ))}
                </div>
            </main>
        </div>
    );
}
