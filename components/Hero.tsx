"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSlugFromUrl } from "@/lib/anime";
import WatchlistButton from "./WatchlistButton";

interface HeroProps {
    data: any[];
}

export default function Hero({ data }: HeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        if (data.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % data.length);
        }
    };

    const prevSlide = () => {
        if (data.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
        }
    };

    useEffect(() => {
        if (data.length > 1) {
            const timer = setInterval(nextSlide, 7000);
            return () => clearInterval(timer);
        }
    }, [data.length]);

    if (!data || data.length === 0) return null;

    const currentAnime = data[currentIndex];
    const isEpisode = currentAnime.href?.includes('-episode-');
    const slug = getSlugFromUrl(currentAnime.href);
    const detailHref = slug
        ? (isEpisode ? `/watch/${slug}` : `/anime/${slug}`)
        : `/anime/${currentAnime.id}`;

    return (
        <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-[80vh] overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={currentAnime.image}
                            alt={currentAnime.title}
                            fill
                            priority
                            className="object-cover opacity-25"
                            sizes="100vw"
                            unoptimized={true}
                        />
                    </div>

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/75 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent" />

                    {/* Content */}
                    <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-12 sm:pb-16 md:pb-20 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex flex-col gap-3 max-w-xl"
                        >
                            {/* Meta row */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-primary text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
                                    Trending
                                </span>
                                <span className="text-zinc-400 text-xs sm:text-sm">{currentAnime.type}</span>
                                {currentAnime.episode && (
                                    <span className="text-zinc-500 text-xs sm:text-sm">· {currentAnime.episode}</span>
                                )}
                                {currentAnime.rating && parseFloat(currentAnime.rating) > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                                        <span className="text-xs sm:text-sm font-medium">{currentAnime.rating}</span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight line-clamp-2">
                                {currentAnime.title}
                            </h1>

                            <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-lg line-clamp-2 hidden sm:block">
                                Tonton {currentAnime.title} dengan subtitle Indonesia terlengkap di Samehadakuu.
                            </p>

                            <div className="flex items-center gap-2 sm:gap-3 pt-1">
                                <Link
                                    href={detailHref}
                                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm transition-colors"
                                >
                                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                    Tonton Sekarang
                                </Link>
                                <WatchlistButton
                                    size="lg"
                                    anime={{
                                        id: currentAnime.id,
                                        title: currentAnime.title,
                                        image: currentAnime.image,
                                        type: currentAnime.type,
                                        href: currentAnime.href
                                    }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation controls */}
            {data.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 md:right-8 flex items-center gap-1.5 sm:gap-2">
                    {/* Slide indicators */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mr-2 sm:mr-3">
                        {data.slice(0, 6).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                suppressHydrationWarning
                                className={`h-1 transition-all duration-300 rounded-full ${
                                    i === currentIndex
                                        ? "w-4 sm:w-6 bg-primary"
                                        : "w-2 sm:w-3 bg-white/25 hover:bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={prevSlide}
                        suppressHydrationWarning
                        className="p-1.5 sm:p-2 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 text-white transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        suppressHydrationWarning
                        className="p-1.5 sm:p-2 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 text-white transition-all"
                    >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
