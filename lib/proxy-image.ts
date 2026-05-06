/**
 * Converts an external anime image URL to go through our image proxy.
 * This bypasses hotlink protection from source sites like samehadaku.
 *
 * Usage: <img src={proxyImage(video.videoImage)} />
 */
export function proxyImage(url: string | null | undefined): string {
    if (!url) return "/placeholder-thumb.jpg";
    // Already a local/proxied URL — skip
    if (url.startsWith("/") || url.startsWith(process.env.NEXT_PUBLIC_BASE_URL || "")) {
        return url;
    }
    return `/api/img?url=${encodeURIComponent(url)}`;
}
