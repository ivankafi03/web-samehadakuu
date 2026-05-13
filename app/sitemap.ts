import { MetadataRoute } from 'next'
import { getLatestAnime, getSlugFromUrl, AnimeLatest } from '@/lib/anime'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const latestAnime = await getLatestAnime()
    const baseUrl = 'https://samehadakuu.com'

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/anime',
        '/jadwal',
        '/completed',
        '/ongoing',
        '/watchlist',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '' ? 'hourly' : 'daily') as any,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Anime Routes
    const animeLinks = latestAnime.map((anime: AnimeLatest) => ({
        url: `${baseUrl}/watch/${getSlugFromUrl(anime.link)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }))

    return [
        ...staticRoutes,
        ...animeLinks,
    ]
}
