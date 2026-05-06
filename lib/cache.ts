/**
 * In-memory cache utility
 * Zero dependencies, zero config — data disimpan di RAM server.
 * TTL (time-to-live) dalam detik.
 *
 * Cara upgrade ke Redis nanti:
 * Tinggal ganti implementasi getCache/setCache/deleteCache
 * tanpa ubah apapun di route files.
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number; // Unix timestamp ms
}

// Global store — satu instance selama server hidup
const store = new Map<string, CacheEntry<unknown>>();

// Cleanup otomatis setiap 5 menit untuk buang entry expired
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.expiresAt < now) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Ambil data dari cache.
 * Return null kalau tidak ada atau sudah expired.
 */
export function getCache<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Simpan data ke cache dengan TTL.
 * @param key   - Cache key unik
 * @param data  - Data yang disimpan
 * @param ttlSeconds - Berapa detik cache berlaku (default 5 menit)
 */
export function setCache<T>(key: string, data: T, ttlSeconds = 300): void {
    store.set(key, {
        data,
        expiresAt: Date.now() + ttlSeconds * 1000,
    });
}

/**
 * Hapus satu cache key (untuk invalidation).
 */
export function deleteCache(key: string): void {
    store.delete(key);
}

/**
 * Hapus semua cache key yang mengandung prefix tertentu.
 * Berguna untuk invalidate group cache (misal semua ranking).
 */
export function deleteCacheByPrefix(prefix: string): void {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
            store.delete(key);
        }
    }
}

/**
 * Helper: get-or-set pattern.
 * Kalau ada cache → return langsung.
 * Kalau tidak ada → jalankan fetcher, simpan hasilnya, return.
 */
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = 300
): Promise<T> {
    const cached = getCache<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    setCache(key, fresh, ttlSeconds);
    return fresh;
}
