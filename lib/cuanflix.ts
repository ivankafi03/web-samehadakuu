import * as cheerio from 'cheerio';

const SOURCE_URL = "https://samehadaku.li/";

// In-memory cache for ratings to avoid redundant fetching
const ratingCache = new Map<string, string>();

/**
 * Mencoba mengekstrak nomor episode dari string.
 * Jika tidak ada angka, akan mengembalikan string aslinya (misalnya "TAMAT", "Film").
 */
function cleanEpisode(ep: string): string {
    if (!ep) return '0';
    const trimmed = ep.replace(/Episode/i, '').trim();
    const match = trimmed.match(/\d+/);
    if (match) return match[0];
    return trimmed || '0';
}

/**
 * Membersihkan string rating untuk mengambil hanya nilai numeriknya.
 * Menangani format seperti "Rating 8.5", "8.5/10", atau hanya "8.5".
 */
function cleanRating(rating: string): string {
    if (!rating) return '0.0';
    const match = rating.match(/[\d.]+/);
    if (match) {
        const val = parseFloat(match[0]);
        return isNaN(val) ? '0.0' : val.toFixed(1);
    }
    return '0.0';
}

/**
 * Normalizes URLs from the scraper to always use the current active domain.
 * This is necessary because the source site often hardcodes the old domain in its HTML.
 */
function normalizeUrl(url: string | undefined): string {
    if (!url) return '';
    
    // Core replacement: Ensure we point to the active domain for assets
    // but allow the main SOURCE_URL to remain .ac as requested by user
    let normalized = url.replace(/https?:\/\/(www\.)?(samehadaku\.io|samehadaku\.care|v2\.samehadaku\.how|samehadaku\.li|samehadaku\.ac)/gi, 'https://samehadaku.li');
    
    // Cleanup WP Jetpack CDN links that often break or return low quality
    if (normalized.includes('wp.com')) {
        normalized = normalized.replace(/https?:\/\/i\d+\.wp\.com\//i, 'https://');
        // Remove resize parameters to get full quality
        normalized = normalized.split('?')[0];
    }

    if (normalized.startsWith('http:')) normalized = normalized.replace('http:', 'https:');
    if (normalized.startsWith('//')) normalized = `https:${normalized}`;
    
    // Special case: If it's a page link (not an image), we might want to keep the SOURCE_URL domain
    // but for now, pointing to .li for everything except the initial fetch is safer for assets.
    
    return normalized;
}

/**
 * Extracts a slug from a full source URL.
 * Example: https://source.li/anime/one-piece/ -> anime/one-piece
 */
export function getSlugFromUrl(url: string | undefined): string {
    if (!url) return '';
    const normalized = normalizeUrl(url);
    try {
        const urlObj = new URL(normalized);
        // Remove leading and trailing slashes
        return urlObj.pathname.replace(/^\/+|\/+$/g, '');
    } catch (e) {
        // Fallback for relative paths
        return url.replace(/^\/+|\/+$/g, '');
    }
}

/**
 * Reconstructs a full URL from a slug.
 */
export function getUrlFromSlug(slug: string): string {
    if (!slug) return SOURCE_URL;
    return `${SOURCE_URL}${slug}/`;
}

/**
 * Cleans titles from duplicate text that sometimes occurs during scraping.
 * Example: "One Piece One Piece" -> "One Piece"
 */
function cleanTitle(title: string): string {
    if (!title) return "";
    const trimmed = title.trim();
    const half = Math.floor(trimmed.length / 2);
    const firstHalf = trimmed.substring(0, half).trim();
    const secondHalf = trimmed.substring(trimmed.length - half).trim();

    if (firstHalf === secondHalf && trimmed.length > 4) {
        return firstHalf;
    }

    // Also handle cases with space in between
    const words = trimmed.split(/\s+/);
    if (words.length % 2 === 0) {
        const mid = words.length / 2;
        const part1 = words.slice(0, mid).join(" ");
        const part2 = words.slice(mid).join(" ");
        if (part1 === part2) return part1;
    }

    return trimmed;
}

export interface AnimeLatest {
    title: string;
    image: string;
    link: string;
    episode: string;
    rating?: string;
    type: string;
    href: string;
}

export interface Episode {
    title: string;
    link: string;
    eps: string;
    date: string;
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
    episodes: Episode[];
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

/**
 * Memetakan item dari scraper ke model data yang digunakan oleh UI.
 */
export function mapAnimeItem(item: AnimeLatest, index: number) {
    return {
        id: index + 1,
        title: item.title,
        image: item.image,
        rating: parseFloat(item.rating && item.rating !== '?' ? item.rating : '0') || 0,
        episodes: parseInt(cleanEpisode(item.episode)) || 0,
        episodeRaw: item.episode,
        type: item.type,
        href: item.link
    };
}

/**
 * Memetakan daftar item dari scraper ke model data yang digunakan oleh UI.
 */
export function mapAnimeList(items: AnimeLatest[]) {
    return items.map((item, index) => mapAnimeItem(item, index));
}

/**
 * Extracts ratings from the sidebar widgets (Weekly/Monthly popular) to enrich listing data.
 */
function scrapeSidebarRatings($: cheerio.CheerioAPI): Map<string, string> {
    const ratingsMap = new Map<string, string>();

    // Look for popular sidebar items with expanded selectors
    $('.wpop-p-list li, .popular-series li, .wpop-p-tab #weekly li, .wpop-p-tab #monthly li, .wpp-list li, li.wpop-weekly, li.wpop-monthly, .wpop_i li').each((_, el) => {
        const title = $(el).find('.series, .title, .tt, .series a').text().trim() || $(el).find('h2, h3, h4').text().trim();
        let rating = $(el).find('.numscore, .rating, .score, .upscore').text().trim();

        // If rating element is not found, try to find pattern X.XX in text
        if (!rating || !/\d/.test(rating)) {
            const match = $(el).text().match(/\d\.\d{1,2}/);
            if (match) rating = match[0];
        }

        if (title && rating && rating !== 'N/A') {
            const cleanTitleStr = cleanTitle(title).toLowerCase();
            ratingsMap.set(title.toLowerCase(), rating);
            ratingsMap.set(cleanTitleStr, rating);

            // Handle variations (e.g. without "Episode X")
            const baseTitle = cleanTitleStr.replace(/episode \d+.*$/i, '').trim();
            if (baseTitle && baseTitle !== cleanTitleStr) {
                ratingsMap.set(baseTitle, rating);
            }
        }
    });

    return ratingsMap;
}

/**
 * Extracts popular anime details (title, rating, link, image) from the sidebar.
 * This is used as a fallback if the main slider is empty or to populate popular sections.
 */
function scrapePopularSidebar($: cheerio.CheerioAPI): AnimeLatest[] {
    const popular: AnimeLatest[] = [];
    // Wider range of selectors for better compatibility across domain changes
    $('.wpop-weekly, .wpop-monthly, .wpop-p-list li, .popular-series li, .wpp-list li, .wpop_i li').each((_, el) => {
        const titleEl = $(el).find('.series, .title, .tt, .series a').first();
        const titleRaw = titleEl.text().trim() || $(el).find('h2, h3, h4').first().text().trim();
        const title = cleanTitle(titleRaw);
        const link = normalizeUrl(titleEl.attr('href') || $(el).find('a').first().attr('href'));
        const imgEl = $(el).find('img');
        let image = imgEl.attr('data-src') || imgEl.attr('src') || '';
        if (image && image.startsWith('//')) image = `https:${image}`;
        if (image && !image.startsWith('http')) image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
        image = normalizeUrl(image);

        let rating = $(el).find('.numscore, .rating, .score, .upscore, .rating-value').text().trim();
        if (!rating || rating === '0.0' || rating === 'N/A') {
            // Try to find rating in any text matching digits followed by dot and digits
            const textContent = $(el).text();
            const match = textContent.match(/(\d\.\d)/);
            if (match) rating = match[1];
        }

        const typeValue = $(el).find('.typez, .type').text().trim() || 'TV';

        if (title && link) {
            popular.push({
                title,
                image,
                link,
                rating: cleanRating(rating),
                episode: '?',
                type: typeValue,
                href: link
            });
        }
    });

    // Remove duplicates by link
    return popular.filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);
}

async function fetchWithTimeout(url: string, options: any = {}) {
    const { timeout = 30000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const targetUrl = normalizeUrl(url);

    try {
        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/',
                'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                ...options.headers
            },
            next: options.next || { revalidate: 3600 }
        });
        clearTimeout(id);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Page not found (404): ${targetUrl}`);
                return ""; // Return empty string instead of throwing
            }
            console.error(`HTTP Fetch Error: ${response.status} ${response.statusText} for ${targetUrl}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

/**
 * Enriches a list of anime items with ratings using the in-memory cache populated by the sidebar.
 * By default, it avoids individual network fetches for speed, unless 'force' is true.
 */
async function enrichAnimeWithRatings(items: AnimeLatest[], limit: number = 40, force: boolean = false): Promise<AnimeLatest[]> {
    // Only take the first 'limit' items that don't have a valid rating
    const pool = items.slice(0, Math.min(items.length, limit));
    const itemsToFetch = pool.filter(item => !item.rating || item.rating === '0.0' || item.rating === '-');

    if (itemsToFetch.length === 0) return items;

    // Use cache first (populated by sidebar scraper)
    itemsToFetch.forEach(item => {
        const slug = getSlugFromUrl(item.link);
        if (ratingCache.has(slug)) {
            item.rating = ratingCache.get(slug);
        }
    });

    // If 'force' is false, we skip individual network fetches to keep navigation fast
    if (!force) return items;

    // For featured content or forced enrichment, we do individual fetches in small batches
    const remainingToFetch = itemsToFetch.filter(item => !item.rating || item.rating === '0.0');
    if (remainingToFetch.length === 0) return items;

    const BATCH_SIZE = 5;
    for (let i = 0; i < remainingToFetch.length; i += BATCH_SIZE) {
        const batch = remainingToFetch.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item) => {
            const slug = getSlugFromUrl(item.link);
            try {
                const detail = await getAnimeDetail(item.link);
                if (detail?.rating && detail.rating !== '0.0') {
                    item.rating = detail.rating;
                    ratingCache.set(slug, detail.rating);
                }
            } catch (error) { }
        }));
    }

    return items;
}

export async function getFeaturedAnime(): Promise<AnimeLatest[]> {
    try {
        const html = await fetchWithTimeout(SOURCE_URL);
        const $ = cheerio.load(html);
        const featured: AnimeLatest[] = [];

        $('.loop .item, .loop .slide-item, .owl-carousel .item').each((_, el) => {
            const titleEl = $(el).find('.title, h2, h3, a.title, .ellipsis a');
            const linkEl = $(el).find('a').first();
            const imgEl = $(el).find('img').first();

            const title = cleanTitle(titleEl.text().trim() || linkEl.text().trim());
            const link = normalizeUrl(linkEl.attr('href') || '');
            let image = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('srcset')?.split(' ')[0] || '';
            if (image && !image.startsWith('http') && !image.startsWith('//')) {
                image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
            }
            image = normalizeUrl(image);
            const typeValue = $(el).find('.type').text().trim() || 'TV';

            if (title && link) {
                featured.push({
                    title,
                    image,
                    link,
                    episode: '?',
                    rating: '0.0',
                    type: typeValue,
                    href: link
                });
            }
        });

        // Fallback: If no featured items found (e.g. on samehadaku.ac), use popular sidebar
        if (featured.length === 0) {
            console.log('No featured items found in slider, falling back to popular sidebar...');
            const popular = await getPopularAnime();
            featured.push(...popular.slice(0, 10));
        }

        const uniqueResults = featured.filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);
        // Force enrichment for featured items (usually 5-10 items) to ensure they look good
        return await enrichAnimeWithRatings(uniqueResults, 10, true);
    } catch (error) {
        console.error('Error scraping featured anime:', error);
        return [];
    }
}

export async function getOngoingAnime(): Promise<AnimeLatest[]> {
    return getAnimeList('anime/?status=ongoing');
}

export async function getMovieAnime(): Promise<AnimeLatest[]> {
    return getAnimeList('anime/?status=&type=movie&order=update');
}

export async function getLatestAnime(): Promise<AnimeLatest[]> {
    try {
        const html = await fetchWithTimeout(SOURCE_URL);
        const $ = cheerio.load(html);
        const results: AnimeLatest[] = [];

        const sidebarRatings = scrapeSidebarRatings($);

        // samehadaku.li listing structure
        $('li[itemscope="itemscope"], article, .animepost').each((i, el) => {
            const titleEl = $(el).find('h2.entry-title a, .title a, h2 a, .tt');
            const titleRaw = titleEl.text().trim() || $(el).attr('title') || '';
            const title = cleanTitle(titleRaw);
            const link = normalizeUrl(titleEl.attr('href') || $(el).find('a').first().attr('href'));
            const imgEl = $(el).find('img');
            let image = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('srcset')?.split(' ')[0] || '';
            if (image && !image.startsWith('http') && !image.startsWith('//')) {
                image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
            }
            image = normalizeUrl(image);

            let episode = $(el).find('.epx, .ep, span:contains("Episode")').text().replace(/Episode/i, '').trim();
            if (!episode) episode = $(el).find('.dtla span').first().text().trim();

            let rating = $(el).find('.numscore, .rating strong, .upscore, .score, .rating-value, .tpinfo span:first-child').text().trim();
            // Fallback 1: Check sidebar ratings map
            if (!rating || rating === '0.0') {
                rating = sidebarRatings.get(title.toLowerCase()) || '';
            }

            // Fallback 2: Check if there's a rating in any text within the element
            if (!rating || rating === '0.0') {
                const textContent = $(el).text();
                const scoreMatch = textContent.match(/Rating:\s*([\d.]+)/i) || textContent.match(/([\d.]+)\/10/) || textContent.match(/(\d\.\d)/);
                if (scoreMatch) rating = scoreMatch[1];
            }

            const typeValue = $(el).find('.typez, .type').text().trim();

            if (title && link) {
                results.push({
                    title,
                    image,
                    link,
                    episode: episode || '?',
                    rating: cleanRating(rating),
                    type: typeValue || 'TV',
                    href: link
                });
            }
        });

        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);

        // Fast enrichment using cache only for listing pages
        return await enrichAnimeWithRatings(uniqueResults, 40, false);
    } catch (error) {
        console.error('Error scraping latest anime:', error);
        return [];
    }
}

export async function getPopularAnime(): Promise<AnimeLatest[]> {
    try {
        // Fetch from the official popular listing for a complete list
        const results = await getAnimeList('anime/?status=&type=&order=popular');
        
        if (results.length > 0) {
            return results;
        }

        // Fallback to sidebar if listing fails
        const html = await fetchWithTimeout(SOURCE_URL);
        const $ = cheerio.load(html);
        return scrapePopularSidebar($);
    } catch (error) {
        console.error('Error scraping popular anime:', error);
        return [];
    }
}

export async function getAnimeDetail(url: string): Promise<AnimeDetail | null> {
    try {
        let targetUrl = normalizeUrl(url);

        // Detection: If it's an episode page, find the series link first
        // Samehadaku episode links often look like /title-is-here-episode-X-sub-indo/
        // While series links are /anime/title-is-here/
        // Detection: If it's an episode page or malformed slug, find the series link first
        const isLikelyEpisode = targetUrl.includes('subtitle-indonesia') || 
                               targetUrl.includes('episode') || 
                               targetUrl.match(/-\d+-sub/i) ||
                               !targetUrl.includes('/anime/');

        if (isLikelyEpisode) {
            console.log(`Potential episode/malformed page detected: ${targetUrl}. Searching for series link...`);
            const epHtml = await fetchWithTimeout(targetUrl).catch(() => "");
            if (!epHtml) return null;
            
            const $ep = cheerio.load(epHtml);
            const seriesLink =
                $ep('.extpinfo a[href*="/anime/"]').first().attr('href') ||
                $ep('.infseries a[href*="/anime/"]').first().attr('href') ||
                $ep('.year a[href*="/anime/"]').first().attr('href') ||
                $ep('.nvs.nvsc a').first().attr('href');

            if (seriesLink) {
                targetUrl = normalizeUrl(seriesLink);
            } else if (targetUrl.includes('subtitle-indonesia')) {
                // Last ditch effort: try to strip the suffix if it's a known bad pattern
                targetUrl = targetUrl.replace('-subtitle-indonesia', '').replace(/-episode-\d+.*$/, '');
            }
        }

        const html = await fetchWithTimeout(targetUrl).catch(err => {
            console.warn(`Failed to fetch anime detail for ${targetUrl}:`, err.message);
            return "";
        });

        if (!html) return null;
        const $ = cheerio.load(html);

        const titleRaw = $('.entry-title').text().trim() || $('h1.entry-title').text().trim();
        if (!titleRaw) return null; // If we can't find a title, it's a 404 or invalid page
        const title = cleanTitle(titleRaw);
        const synopsis = $('.desc').text().trim() || $('.entry-content').text().trim();
        const imgEl = $('.thumb img');
        let image = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('srcset')?.split(' ')[0] || '';
        if (image && !image.startsWith('http') && !image.startsWith('//')) {
            image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
        }
        image = normalizeUrl(image);

        // Improved rating extraction with multiple fallbacks
        const ratingRaw =
            $('meta[itemprop="ratingValue"]').attr('content') ||
            $('.rating strong').text().trim() ||
            $('.numscore').text().trim() ||
            $('.score').text().trim();

        const rating = cleanRating(ratingRaw);

        const genres: string[] = [];
        $('.genre-info a, .genredet a').each((i, el) => {
            genres.push($(el).text().trim());
        });

        const info: any = {};
        $('.info-content .spe span, .spe span').each((i, el) => {
            const text = $(el).text();
            if (text.includes(':')) {
                const [key, ...valParts] = text.split(':');
                const value = valParts.join(':').trim();
                info[key.trim().toLowerCase()] = value;
            }
        });

        const episodes: Episode[] = [];
        $('.lstepsiode.listeps li, .eplister ul li, .lsteps ul li').each((i, el) => {
            const linkEl = $(el).find('div.epsleft span.lchx a, a');
            const epTitle = linkEl.text().trim() || $(el).find('.epl-title').text().trim();
            const eps = $(el).find('div.epsright span.eps a, .epl-num').text().trim();
            const date = $(el).find('div.epsleft span.date, .epl-date').text().trim();
            const link = normalizeUrl(linkEl.attr('href') || '');

            if (epTitle && link) {
                episodes.push({ title: epTitle, link, eps, date });
            }
        });

        return {
            title,
            originalTitle: info['original title'] || info['japanese'] || info['english'] || '',
            synopsis,
            image,
            rating,
            status: info['status'] || '',
            studio: info['studio'] || '',
            released: info['released'] || info['published'] || '',
            genres,
            episodes
        };
    } catch (error) {
        console.error('Error scraping anime detail:', error);
        return null;
    }
}

export async function getWatchPageData(url: string): Promise<WatchPageData | null> {
    try {
        const html = await fetchWithTimeout(url, {
            next: { revalidate: 3600 } // 1 hour
        });
        const $ = cheerio.load(html);

        const titleRaw = $('.entry-title').text().trim() || $('h1.entry-title').text().trim();
        const title = cleanTitle(titleRaw);

        // Improved poster extraction with lazy loading support
        let poster = $('meta[property="og:image"]').attr('content') ||
            $('.thumb img').attr('data-lazy-src') ||
            $('.thumb img').attr('data-src') ||
            $('.thumb img').attr('src') ||
            $('.thumb img').attr('srcset')?.split(' ')[0] ||
            $('.poster img').attr('data-lazy-src') ||
            $('.poster img').attr('data-src') ||
            $('.poster img').attr('src') ||
            $('img.ts-post-image').attr('data-lazy-src') ||
            $('img.ts-post-image').attr('data-src') ||
            $('img.ts-post-image').attr('src') || '';

        // If poster is still empty, look for any image in .thumb
        if (!poster) {
            poster = $('.thumb').find('img').first().attr('data-lazy-src') || $('.thumb').find('img').first().attr('src') || '';
        }

        // Normalize the poster URL
        if (poster && !poster.startsWith('http') && !poster.startsWith('//')) {
            poster = `${SOURCE_URL.replace(/\/$/, '')}${poster.startsWith('/') ? '' : '/'}${poster}`;
        }
        poster = normalizeUrl(poster);

        const ratingRaw = $('.rating strong, .numscore').text().trim();
        const rating = cleanRating(ratingRaw);
        const episode = $('.epx, .ep').first().text().replace(/Episode/i, '').trim() || '?';
        const typeValue = $('.typez, .type').first().text().trim() || 'TV';

        const servers: VideoServer[] = [];
        $('.mirror option').each((i, el) => {
            let name = $(el).text().trim();
            const base64Value = $(el).attr('value') || '';
            
            if (base64Value && base64Value !== '0') {
                try {
                    let decodedHtml = '';
                    if (base64Value.includes('<iframe') || base64Value.includes('src=')) {
                        decodedHtml = base64Value;
                    } else {
                        try {
                            decodedHtml = Buffer.from(base64Value, 'base64').toString('utf-8');
                        } catch (e) {
                            decodedHtml = base64Value;
                        }
                    }
                    
                    const iframeMatch = decodedHtml.match(/src=["']([^"']+)["']/i);
                    const iframeSrc = iframeMatch ? iframeMatch[1] : (decodedHtml.startsWith('http') ? decodedHtml : '');

                    if (iframeSrc) {
                        // Clean name: remove common artifacts and ensure it's not just HTML
                        if (!name || name.startsWith('<') || name.length > 20) {
                            name = `Server ${servers.length + 1}`;
                        }
                        
                        // Additional cleaning for specific known artifacts
                        name = name.replace(/Subtitle Indonesia/gi, '').trim();

                        const serverName = name;
                        if (iframeSrc.startsWith('//')) {
                            servers.push({ name: serverName, iframe: `https:${iframeSrc}` });
                        } else {
                            servers.push({ name: serverName, iframe: iframeSrc });
                        }
                    }
                } catch (e) {
                    console.error('Error decoding video server:', e);
                }
            }
        });

        const downloads: any[] = [];

        function resolveSafelink(link: string): string {
            if (!link) return "";
            try {
                // Common pattern for anjay.me / soralink: base64 in the path
                const urlObj = new URL(link);
                const pathParts = urlObj.pathname.split('/');
                const lastPart = pathParts[pathParts.length - 1];
                
                // If it looks like base64 (usually long and alphanumeric)
                if (lastPart && lastPart.length > 20 && /^[A-Za-z0-9+/=]+$/.test(lastPart)) {
                    const decoded = Buffer.from(lastPart, 'base64').toString('utf-8');
                    if (decoded.startsWith('http')) return decoded;
                }
                
                // Check query parameters (e.g. ?url=...)
                const urlParam = urlObj.searchParams.get('url') || urlObj.searchParams.get('link') || urlObj.searchParams.get('id');
                if (urlParam && urlParam.startsWith('http')) return urlParam;
                if (urlParam && /^[A-Za-z0-9+/=]+$/.test(urlParam)) {
                    const decoded = Buffer.from(urlParam, 'base64').toString('utf-8');
                    if (decoded.startsWith('http')) return decoded;
                }
            } catch (e) {}
            return link;
        }

        $('.download-eps, .download-list, .dl-links, .download, .download-eps ul li, .download-list ul li').each((i, el) => {
            const format = $(el).find('strong, b').first().text().trim() || "HD Quality";
            const links: any[] = [];
            $(el).find('a').each((k, a) => {
                const name = $(a).text().trim();
                let link = $(a).attr('href') || '';
                
                if (link && !link.includes('facebook.com') && !link.includes('twitter.com')) {
                    // Try to resolve safelink
                    const resolvedLink = resolveSafelink(link);
                    links.push({ name, link: resolvedLink });
                }
            });
            if (links.length > 0) {
                downloads.push({ format, links });
            }
        });

        return { title, poster, rating, episode, type: typeValue, servers, downloads };
    } catch (error) {
        console.error('Error scraping watch page data:', error);
        return null;
    }
}

export async function getAnimeList(path: string): Promise<AnimeLatest[]> {
    try {
        let url = path.startsWith('http') ? normalizeUrl(path) : `${SOURCE_URL}${path}`;
        const html = await fetchWithTimeout(url);
        const $ = cheerio.load(html);
        const results: AnimeLatest[] = [];

        const sidebarRatings = scrapeSidebarRatings($);

        $('li[itemscope="itemscope"], article, .animepost').each((i, el) => {
            const titleEl = $(el).find('h2.entry-title a, .title a, h2 a, .tt');
            const titleRaw = titleEl.text().trim();
            const title = cleanTitle(titleRaw);
            const link = normalizeUrl(titleEl.attr('href') || $(el).find('a').first().attr('href'));
            const imgEl = $(el).find('img');
            let image = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('srcset')?.split(' ')[0] || '';
            if (image && !image.startsWith('http') && !image.startsWith('//')) {
                image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
            }
            image = normalizeUrl(image);
            let rating = $(el).find('.numscore, .rating strong, .upscore, .score, .rating-value, .tpinfo span:first-child').text().trim();

            if (!rating || rating === '0.0') {
                rating = sidebarRatings.get(title.toLowerCase()) || '0.0';
            }

            if (rating === '0.0') {
                const textContent = $(el).text();
                const scoreMatch = textContent.match(/Rating:\s*([\d.]+)/i) || textContent.match(/([\d.]+)\/10/) || textContent.match(/(\d\.\d)/);
                if (scoreMatch) rating = scoreMatch[1];
            }

            const episode = $(el).find('.epx, .ep, .dtla span:contains("Episode")').text().replace(/Episode/i, '').trim();
            const typeValue = $(el).find('.typez, .type').text().trim();

            if (title && link) {
                results.push({
                    title,
                    image,
                    link,
                    rating: cleanRating(rating),
                    episode: episode || '?',
                    type: typeValue || 'TV',
                    href: link
                });
            }
        });

        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);

        // Fast enrichment using cache only for listing pages
        return await enrichAnimeWithRatings(uniqueResults, 12, false);
    } catch (error: any) {
        console.error(`Error scraping anime list from ${path}:`, error.message);
        return [];
    }
}

export async function searchAnime(query: string): Promise<AnimeLatest[]> {
    try {
        const url = `${SOURCE_URL}?s=${encodeURIComponent(query)}`;
        const html = await fetchWithTimeout(url);
        const $ = cheerio.load(html);
        const results: AnimeLatest[] = [];

        const sidebarRatings = scrapeSidebarRatings($);

        $('li[itemscope="itemscope"], article, .animepost').each((i, el) => {
            const titleEl = $(el).find('h2.entry-title a, .title a, h2 a, .tt');
            const titleRaw = titleEl.text().trim();
            const title = cleanTitle(titleRaw);
            const link = normalizeUrl(titleEl.attr('href') || $(el).find('a').first().attr('href'));
            const imgEl = $(el).find('img');
            let image = imgEl.attr('data-lazy-src') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('srcset')?.split(' ')[0] || '';
            if (image && !image.startsWith('http') && !image.startsWith('//')) {
                image = `${SOURCE_URL}${image.startsWith('/') ? image.slice(1) : image}`;
            }
            image = normalizeUrl(image);
            let rating = $(el).find('.numscore, .rating strong, .upscore, .score, .rating-value, .tpinfo span:first-child').text().trim();

            if (!rating || rating === '0.0') {
                rating = sidebarRatings.get(title.toLowerCase()) || '0.0';
            }

            if (rating === '0.0') {
                const textContent = $(el).text();
                const scoreMatch = textContent.match(/Rating:\s*([\d.]+)/i) || textContent.match(/([\d.]+)\/10/) || textContent.match(/(\d\.\d)/);
                if (scoreMatch) rating = scoreMatch[1];
            }

            const episode = $(el).find('.epx, .ep, .dtla span:contains("Episode")').text().replace(/Episode/i, '').trim();
            const typeValue = $(el).find('.typez, .type').text().trim();

            if (title && link) {
                results.push({
                    title,
                    image,
                    link,
                    rating: cleanRating(rating),
                    episode: episode || '?',
                    type: typeValue || 'TV',
                    href: link
                });
            }
        });

        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => t.link === v.link) === i);

        // Fast enrichment using cache only for search results
        return await enrichAnimeWithRatings(uniqueResults, 8, false);
    } catch (error: any) {
        console.error(`Error searching anime with query ${query}:`, error.message);
        return [];
    }
}
