import java.util.HashMap;
import java.util.Map;

/**
 * Proxy - controls access to RealSubject with caching and lazy loading
 */
public class ProxyImage implements Image {
    private String filename;
    private RealImage realImage;
    private String cachedData;
    private long cacheTime;
    private static final long CACHE_EXPIRY_MS = 5000; // 5 seconds cache

    // Static cache shared across all proxy instances
    private static Map<String, CacheEntry> globalCache = new HashMap<>();
    private static int cacheHits = 0;
    private static int cacheMisses = 0;

    public ProxyImage(String filename) {
        this.filename = filename;
    }

    @Override
    public String display() throws Exception {
        // Check global cache first
        CacheEntry entry = globalCache.get(filename);
        long currentTime = System.currentTimeMillis();

        if (entry != null && (currentTime - entry.timestamp) < CACHE_EXPIRY_MS) {
            cacheHits++;
            System.out.println("ProxyImage: Cache HIT for " + filename +
                    " (age: " + (currentTime - entry.timestamp) + "ms)");
            return entry.data;
        }

        cacheMisses++;
        System.out.println("ProxyImage: Cache MISS for " + filename);

        // Lazy initialization of real object
        if (realImage == null) {
            System.out.println("ProxyImage: Creating real image on first access");
            realImage = new RealImage(filename);
        }

        // Fetch data from real object
        String data = realImage.display();

        // Update cache
        globalCache.put(filename, new CacheEntry(data, currentTime));
        System.out.println("ProxyImage: Data cached for " + filename);

        return data;
    }

    @Override
    public String getMetadata() {
        return "ProxyImage[url=" + filename + ", cached=" +
                (cachedData != null) + ", realImageCreated=" + (realImage != null) + "]";
    }

    /**
     * Clear cache for this proxy
     */
    public void clearCache() {
        globalCache.remove(filename);
        cachedData = null;
        System.out.println("ProxyImage: Cache cleared for " + filename);
    }

    /**
     * Get cache statistics
     */
    public static void printCacheStats() {
        System.out.println("\n=== Proxy Cache Statistics ===");
        System.out.println("Cache hits: " + cacheHits);
        System.out.println("Cache misses: " + cacheMisses);
        System.out.println("Total requests: " + (cacheHits + cacheMisses));
        if (cacheHits + cacheMisses > 0) {
            System.out.println("Hit ratio: " + (cacheHits * 100.0 / (cacheHits + cacheMisses)) + "%");
        }
        System.out.println("Cached URLs: " + globalCache.size());
    }

    /**
     * Clear all caches
     */
    public static void clearAllCaches() {
        globalCache.clear();
        cacheHits = 0;
        cacheMisses = 0;
        System.out.println("ProxyImage: All caches cleared");
    }

    /**
     * Internal cache entry class
     */
    private static class CacheEntry {
        String data;
        long timestamp;

        CacheEntry(String data, long timestamp) {
            this.data = data;
            this.timestamp = timestamp;
        }
    }
}
