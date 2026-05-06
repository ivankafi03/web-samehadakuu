import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://samehadakuu-scraper.vercel.app'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/dashboard/',
                '/auth/',
                '/blocked/',
                '/watchlist/',
                '/search',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

