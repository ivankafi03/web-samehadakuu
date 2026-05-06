"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimeCard from "./AnimeCard";

interface AnimeData {
    id: number;
    title: string;
    image: string;
    rating: number;
    episodes: number;
    episodeRaw?: string;
    type: string;
}

interface AnimeSectionProps {
    title: string;
    data: AnimeData[];
    href?: string;
}

export default function AnimeSection({ title, data, href }: AnimeSectionProps) {
    return (
        <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white tracking-tight">
                    {title}
                </h2>
                {href && href !== "#" && (
                    <Link
                        href={href}
                        className="text-sm text-zinc-500 hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        Lihat Semua
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-4">
                {data.map((anime) => (
                    <AnimeCard key={anime.id} {...anime} />
                ))}
            </div>
        </section>
    );
}
