"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getSlugFromUrl } from "@/lib/anime";

interface AnimeCardProps {
    id: number;
    title: string;
    image: string;
    rating: number;
    episodes: number;
    episodeRaw?: string;
    type: string;
    href?: string;
}

export default function AnimeCard({ id, title, image, rating, episodes, episodeRaw, type, href }: AnimeCardProps) {
    const isEpisode = href?.includes('-episode-');
    const slug = getSlugFromUrl(href);
    const cleanSlug = slug?.replace(/^anime\//, '').replace(/^watch\//, '');
    const detailHref = cleanSlug
        ? (isEpisode ? `/watch/${cleanSlug}` : `/anime/${cleanSlug}`)
        : `/anime/${id}`;

    const [imgSrc, setImgSrc] = React.useState(image || "/placeholder-poster.png");

    React.useEffect(() => {
        setImgSrc(image || "/placeholder-poster.png");
    }, [image]);

    const epLabel = episodeRaw
        ? (episodeRaw.includes('EP') || /^\d+$/.test(episodeRaw) ? `EP ${episodeRaw}` : episodeRaw)
        : `EP ${episodes}`;

    return (
        <div className="group flex flex-col gap-2">
            <Link href={detailHref} className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 block">
                <Image
                    src={imgSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={true}
                    onError={() => setImgSrc("/placeholder-poster.png")}
                />

                {/* Hover overlay — simple dimming */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Top badges */}
                <div className="absolute top-2 left-2">
                    <span className="bg-black/70 text-white text-[9px] font-medium px-1.5 py-0.5 rounded uppercase">
                        {type}
                    </span>
                </div>

                {/* Bottom row: rating + episode */}
                <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-end">
                    {rating > 0 ? (
                        <div className="flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded">
                            <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                            <span className="text-white text-[9px] font-medium">{rating}</span>
                        </div>
                    ) : <div />}
                    <span className="bg-primary text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                        {epLabel}
                    </span>
                </div>
            </Link>

            <div className="px-0.5">
                <Link href={detailHref}>
                    <h3 className="text-xs sm:text-sm font-medium text-zinc-200 line-clamp-2 hover:text-white transition-colors leading-snug">
                        {title}
                    </h3>
                </Link>
            </div>
        </div>
    );
}
