import { MetadataRoute } from 'next'
import { getLatestAnime, getSlugFromUrl } from '@/lib/anime'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const latestAnime = await getLatestAnime()
    const baseUrl = 'https://samehadakuu-scraper.vercel.app' // Optional: provide your custom domain

    const animeLinks = latestAnime.map((anime) => ({
        url: `${baseUrl}/watch/${getSlugFromUrl(anime.link)}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 1,
        },
        ...animeLinks,
    ]
}
