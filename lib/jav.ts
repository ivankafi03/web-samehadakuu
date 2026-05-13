import * as cheerio from 'cheerio';
import prisma from "./prisma";

const SOURCE_URL = "https://nontonasik.my.id/jav-domain/";

// Interfaces to match lib/anime.ts
export interface AnimeLatest {
    title: string;
    image: string;
    link: string;
    episode: string;
    rating?: string;
    type: string;
    href: string;
}

export interface HomepageCategory {
    title: string;
    videos: AnimeLatest[];
}

export interface VideoServer {
    name: string;
    iframe: string;
}

export interface WatchPageData {
    title: string;
    poster: string;
    rating: string;
    episode: string;
    type: string;
    servers: VideoServer[];
    downloads: any[];
}

export interface AnimeDetail {
    title: string;
    originalTitle: string;
    synopsis: string;
    image: string;
    rating: string;
    status: string;
    studio: string;
    released: string;
    genres: string[];
    episodes: { title: string; link: string; eps: string; date: string }[];
}

function cleanTitle(title: string): string {
    if (!title) return "";
    
    // 1. Extract JAV Codes (e.g., ABC-123, FC2-PPV-123456)
    const codeMatch = title.match(/[A-Z0-9]+-[A-Z0-9-]+/gi);
    const codes = codeMatch ? Array.from(new Set(codeMatch.map(c => c.toUpperCase()))) : [];
    
    // 2. Extract Quality Tags
    const qualityTags = [];
    if (/\bHD\b|HD(?=[A-Z0-9])/i.test(title)) qualityTags.push("HD");
    if (/\b4K\b/i.test(title)) qualityTags.push("4K");
    if (/\bVR\b/i.test(title)) qualityTags.push("VR");
    if (/\bFHD\b/i.test(title)) qualityTags.push("FHD");

    // If we found a code, prioritize it
    if (codes.length > 0) {
        // Take the first code and append quality tags
        const primaryCode = codes[0];
        return `${primaryCode} ${qualityTags.join(" ")}`.trim();
    }

    // Fallback: If no code found, just return original title but shorter
    return title.length > 50 ? title.substring(0, 50) + "..." : title;
}

async function fetchWithTimeout(url: string, options: any = {}): Promise<string> {
    const { timeout = 30000, retries = 3 } = options;
    
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    ...options.headers
                }
            });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error: any) {
            clearTimeout(id);
            const isLastRetry = i === retries - 1;
            if (isLastRetry) throw error;
            
            // Wait before retry
            const delay = Math.pow(2, i) * 1000;
            console.warn(`Fetch failed for ${url}, retrying in ${delay}ms... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return "";
}

/**
 * Resolves Nuxt 3 "devalue" format.
 */
function resolveNuxtData(data: any[]): any {
    if (!data || !data.length) return null;
    const cache = new Map();

    function walk(idx: any): any {
        if (idx === null || typeof idx !== 'number') return idx;
        if (cache.has(idx)) return cache.get(idx);

        const val = data[idx];
        if (Array.isArray(val)) {
            const res: any[] = [];
            cache.set(idx, res);
            for (const item of val) res.push(walk(item));
            return res;
        }
        if (val && typeof val === 'object') {
            const res: any = {};
            cache.set(idx, res);
            for (const key in val) res[key] = walk(val[key]);
            return res;
        }
        return val;
    }

    return walk(0);
}

function extractNuxtObject(html: string): any {
    const $ = cheerio.load(html);
    const scriptText = $('#__NUXT_DATA__').html();
    if (!scriptText) return null;
    try {
        const raw = JSON.parse(scriptText);
        const resolved = resolveNuxtData(raw);
        
        const rootObject = Array.isArray(resolved) && resolved[0] === 'ShallowReactive' ? resolved[1] : resolved;
        const dataObj = Array.isArray(rootObject?.data) && rootObject.data[0] === 'ShallowReactive' ? rootObject.data[1] : rootObject?.data;
        
        return dataObj;
    } catch (e) {
        console.error("Nuxt extract error:", e);
        return null;
    }
}

export async function getLatestVideos(page: number = 1): Promise<SearchResult> {
    const CACHE_KEY = `jav_latest_page_${page}`;
    const REVALIDATE_MS = 30 * 60 * 1000; // 30 minutes

    try {
        // 1. Try to get from cache
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as SearchResult;
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            // If fresh, return
            if (age < REVALIDATE_MS) {
                return data;
            }

            // If stale, refresh in background and return stale
            refreshLatestVideosCache(page).catch(err => console.error("BG refresh jav failed:", err));
            return data;
        }

        // 2. Fetch fresh
        return await refreshLatestVideosCache(page);
    } catch (error) {
        console.error('Error in getLatestVideos with cache:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

async function refreshLatestVideosCache(page: number): Promise<SearchResult> {
    try {
        const pageUrl = page === 1 ? `${SOURCE_URL}videos` : `${SOURCE_URL}videos?pg=${page}`;
        const html = await fetchWithTimeout(pageUrl);
        const dataObj = extractNuxtObject(html || "");
        
        const data = dataObj?.['explore-1'] || 
                     dataObj?.['explore-0'] || 
                     dataObj?.['latest'] ||
                     Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = data?.list || [];
        const totalPages = data?.pagecount || 1;
        const total = data?.total || 0;

        const result = {
            videos: list.map((item: any) => ({
                title: cleanTitle(item.name || ''),
                image: item.poster_url || item.thumb_url || '',
                link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
                episode: item.movie_code || '',
                rating: '0.0',
                type: 'JAV',
                href: `jav/${item.id}`
            })),
            totalPages,
            total,
        };

        // Update DB Cache
        await prisma.contentCache.upsert({
            where: { key: `jav_latest_page_${page}` },
            update: {
                data: JSON.stringify(result),
                updatedAt: new Date()
            },
            create: {
                key: `jav_latest_page_${page}`,
                data: JSON.stringify(result)
            }
        });

        return result;
    } catch (error) {
        console.error('Error refreshing JAV latest cache:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}


export interface CategoryResult {
    videos: AnimeLatest[];
    totalPages: number;
    total: number;
}

export async function getVideosByCategory(categoryId: string, page: number = 1): Promise<CategoryResult> {
    try {
        const url = page === 1
            ? `${SOURCE_URL}categories/${categoryId}`
            : `${SOURCE_URL}categories/${categoryId}?pg=${page}`;
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);

        // Key pattern: "category-{id}-{page}"
        const key = `category-${categoryId}-${page}`;
        const data = dataObj?.[key] || Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = data?.list || [];
        const totalPages = data?.pagecount || 1;
        const total = data?.total || 0;

        return {
            videos: list.map((item: any) => ({
                title: cleanTitle(item.name || ''),
                image: item.poster_url || item.thumb_url || '',
                link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
                episode: item.movie_code || item.type_name || '',
                rating: '0.0',
                type: item.type_name || 'JAV',
                href: `jav/${item.id}`
            })),
            totalPages,
            total,
        };
    } catch (error) {
        console.error('Error scraping JAV category:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}


export async function getHomepageCategories(): Promise<HomepageCategory[]> {
    const CACHE_KEY = "homepage_categories";
    const REVALIDATE_MS = 60 * 60 * 1000; // 1 hour

    try {
        // 1. Check DB Cache
        const cached = await prisma.contentCache.findUnique({
            where: { key: CACHE_KEY }
        });

        if (cached) {
            const data = JSON.parse(cached.data) as HomepageCategory[];
            const age = Date.now() - new Date(cached.updatedAt).getTime();

            // If cache is fresh, return it
            if (age < REVALIDATE_MS) {
                return data;
            }

            // If cache is stale, trigger background refresh and return stale data (SWR)
            console.log(`Cache stale for ${CACHE_KEY} (${Math.round(age/1000/60)}m old), refreshing in background...`);
            refreshHomepageCache().catch(err => console.error("Background refresh failed:", err));
            return data;
        }

        // 2. No cache found, must fetch now
        return await refreshHomepageCache();
    } catch (error) {
        console.error('Error in getHomepageCategories with cache:', error);
        return [];
    }
}

async function refreshHomepageCache(): Promise<HomepageCategory[]> {
    const TARGET_CATEGORIES = [
        "Beautiful Breasts",
        "Creampie",
        "Blowjob",
        "Censored",
        "Uncensored",
        "Slender",
        "Beautiful Girl",
        "Amateur",
        "Chinese AV",
        "Big Boobs"
    ];

    try {
        const results = await Promise.all(TARGET_CATEGORIES.map(async (tag) => {
            try {
                const searchResults = await searchJav(tag, 1);
                if (searchResults && searchResults.videos && searchResults.videos.length > 0) {
                    return {
                        title: tag,
                        videos: searchResults.videos.slice(0, 10)
                    };
                }
            } catch (e) {
                console.error(`Error fetching category ${tag}:`, e);
            }
            return null;
        }));

        const fetchedCategories = results.filter((c): c is HomepageCategory => c !== null);
        
        if (fetchedCategories.length > 0) {
            await prisma.contentCache.upsert({
                where: { key: "homepage_categories" },
                update: {
                    data: JSON.stringify(fetchedCategories),
                    updatedAt: new Date()
                },
                create: {
                    key: "homepage_categories",
                    data: JSON.stringify(fetchedCategories)
                }
            });
        }

        return fetchedCategories;
    } catch (error) {
        console.error('Error refreshing homepage cache:', error);
        return [];
    }
}


export async function getJavDetail(id: string): Promise<AnimeDetail | null> {
    try {
        const url = `${SOURCE_URL}videos/${id}`;
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);
        
        const video = dataObj?.[`video-detail-${id}`] || 
                      Object.values(dataObj || {}).find((v: any) => v?.id == id && v?.movie_code);
        
        if (!video) return null;

        return {
            title: cleanTitle(video.name),
            originalTitle: video.movie_code,
            synopsis: video.description || `Watch ${video.name} (${video.movie_code}) in HD quality.`,
            image: video.poster_url || video.thumb_url || '',
            rating: '0.0',
            status: 'Completed',
            studio: video.studio || 'N/A',
            released: video.year || '',
            genres: video.category || [],
            episodes: [
                {
                    title: `Full Movie - ${video.movie_code}`,
                    link: url,
                    eps: '1',
                    date: video.vod_time || ''
                }
            ]
        };
    } catch (error) {
        console.error('Error scraping JAV detail:', error);
        return null;
    }
}

export async function getJavWatchData(id: string): Promise<WatchPageData | null> {
    try {
        const url = `${SOURCE_URL}videos/${id}`;
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);
        
        const video = dataObj?.[`video-detail-${id}`] || 
                      Object.values(dataObj || {}).find((v: any) => v?.id == id && v?.movie_code);
        
        if (!video) return null;

        const servers: VideoServer[] = [];
        
        // 1. Try to get from video.play_url
        if (video.play_url || video.url) {
            servers.push({ name: 'Direct Server', iframe: video.play_url || video.url });
        }

        // 2. Try to get from video.episodes (Nuxt nested structure)
        if (video.episodes?.server_data) {
            const serverData = video.episodes.server_data;
            for (const key of Object.keys(serverData)) {
                const ep = serverData[key];
                if (ep.link_embed) {
                    servers.push({ 
                        name: `${video.episodes.server_name || 'Server'} (${key})`, 
                        iframe: ep.link_embed 
                    });
                }
            }
        }
        
        const $ = cheerio.load(html || "");
        const iframeSrc = $('iframe').attr('src');
        if (iframeSrc && !servers.some(s => s.iframe === iframeSrc)) {
            servers.push({ name: 'Backup Server', iframe: iframeSrc });
        }

        function resolveSafelink(link: string): string {
            if (!link) return "";
            try {
                const urlObj = new URL(link);
                const pathParts = urlObj.pathname.split('/');
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart && lastPart.length > 20 && /^[A-Za-z0-9+/=]+$/.test(lastPart)) {
                    const decoded = Buffer.from(lastPart, 'base64').toString('utf-8');
                    if (decoded.startsWith('http')) return decoded;
                }
                const urlParam = urlObj.searchParams.get('url') || urlObj.searchParams.get('link');
                if (urlParam && urlParam.startsWith('http')) return urlParam;
                if (urlParam && /^[A-Za-z0-9+/=]+$/.test(urlParam)) {
                    const decoded = Buffer.from(urlParam, 'base64').toString('utf-8');
                    if (decoded.startsWith('http')) return decoded;
                }
            } catch (e) {}
            return link;
        }

        async function extractDirectVideo(playUrl: string): Promise<string> {
            if (!playUrl) return "";
            try {
                // If it's already a direct mp4, return it
                if (playUrl.includes('.mp4')) return playUrl;

                // For upload18.org / videy.li / etc.
                if (playUrl.includes('upload18.org') || playUrl.includes('videy.li') || playUrl.includes('doodstream')) {
                    const html = await fetchWithTimeout(playUrl);
                    if (html) {
                        // Match .mp4 links in the HTML or scripts
                        const mp4Match = html.match(/https?:\/\/[^"']+\.mp4[^"']*/i);
                        if (mp4Match) return mp4Match[0];
                        
                        // Fallback for doodstream patterns
                        const doodMatch = html.match(/pass_md5\/([^"']+)/i);
                        if (doodMatch) return playUrl; // Still need the landing page for complex ones
                    }
                }
            } catch (e) {
                console.error("Extraction error:", e);
            }
            return playUrl;
        }

        const downloads: any[] = [];
        if (video.play_url || video.url) {
            const rawLink = video.play_url || video.url;
            const directLink = await extractDirectVideo(rawLink);
            
            downloads.push({
                format: "Premium HD",
                links: [
                    { name: "Direct Download", link: resolveSafelink(directLink) }
                ]
            });
        }

        return {
            title: cleanTitle(video.name),
            poster: video.poster_url || video.thumb_url || '',
            rating: '0.0',
            episode: video.movie_code,
            type: 'JAV',
            servers,
            downloads
        };
    } catch (error) {
        console.error('Error scraping JAV watch data:', error);
        return null;
    }
}

export interface SearchResult {
    videos: AnimeLatest[];
    totalPages: number;
    total: number;
}

export async function searchJav(query: string, page: number = 1): Promise<SearchResult> {
    try {
        const url = page === 1 
            ? `${SOURCE_URL}search?q=${encodeURIComponent(query)}`
            : `${SOURCE_URL}search?q=${encodeURIComponent(query)}&pg=${page}`;
            
        const html = await fetchWithTimeout(url);
        const dataObj = extractNuxtObject(html);
        
        // Key pattern: "search-{query}-{page}"
        const key = `search-${query}-${page}`;
        const data = dataObj?.[key];

        if (!data) {
            console.warn(`Specific search key "${key}" not found in Nuxt data. Falling back to find first list...`);
        }

        const finalData = data || Object.values(dataObj || {}).find((v: any) => v?.list && v?.query === query) || Object.values(dataObj || {}).find((v: any) => v?.list);

        const list = finalData?.list || [];
        const totalPages = finalData?.pagecount || 1;
        const total = finalData?.total || 0;

        return {
            videos: list.map((item: any) => ({
                title: cleanTitle(item.name || ''),
                image: item.poster_url || item.thumb_url || '',
                link: `https://nontonasik.my.id/jav-domain/videos/${item.id}`,
                episode: item.movie_code || item.type_name || '',
                rating: '0.0',
                type: item.type_name || 'JAV',
                href: `jav/${item.id}`
            })),
            totalPages,
            total,
        };
    } catch (error) {
        console.error('Error searching JAV:', error);
        return { videos: [], totalPages: 1, total: 0 };
    }
}

