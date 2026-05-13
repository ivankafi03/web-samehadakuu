import React from "react";
import Link from "next/link";
import ClientImage from "./ClientImage";
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
    const slug = getSlugFromUrl(href);
    const cleanSlug = slug?.replace(/^anime\//, "").replace(/^watch\//, "");
    const detailHref = cleanSlug ? `/watch/${cleanSlug}` : `/anime/${id}`;

    const epLabel = episodeRaw ? episodeRaw : `EP ${episodes}`;

    return (
        <div className="group flex flex-col gap-2">
            <Link href={detailHref} className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-secondary block shadow-sm hover:shadow-2xl transition-all duration-500" prefetch={false}>
                <ClientImage
                    src={image || "/placeholder-poster.png"}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized={true}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* HD badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span className="glass-premium text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                        HD
                    </span>
                </div>

                {/* Premium Action Overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(244,114,182,0.5)] scale-75 group-hover:scale-100 transition-transform duration-500">
                        <svg className="w-5 h-5 fill-white ml-1" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1 scale-90 group-hover:scale-100 transition-transform duration-500 delay-75">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                            Watch Now
                        </span>
                        <div className="h-0.5 w-4 bg-primary rounded-full" />
                    </div>
                </div>
            </Link>

            <div className="px-1 mt-1">
                <Link href={detailHref} prefetch={false}>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug drop-shadow-sm">
                        {title}
                    </h3>
                </Link>
            </div>
        </div>
    );
}
