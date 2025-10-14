package Cloud.CacheAside;

import java.util.*;
import java.util.concurrent.*;
import java.time.Duration;
import java.time.Instant;

/**
 * CacheAside Pattern Demonstration
 *
 * The Cache-Aside pattern loads data on demand into a cache from a data store.
 * This pattern improves performance and helps maintain consistency between data
 * held in the cache and data in the underlying data store.
 *
 * Key Components:
 * - Cache: In-memory storage for frequently accessed data
 * - Data Store: Persistent storage (database)
 * - Cache Manager: Handles cache operations with resilience
 *
 * Cloud Resilience Features:
 * - Automatic cache invalidation
 * - Circuit breaker for data store failures
 * - Retry logic with exponential backoff
 * - Async cache warming
 * - Cache eviction policies
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== CacheAside Pattern Demo ===\n");

        // Scenario 1: Basic cache-aside read-through
        demonstrateBasicCacheAside();

        // Scenario 2: Cache miss and population
        demonstrateCacheMissScenario();

        // Scenario 3: Cache invalidation on updates
        demonstrateCacheInvalidation();

        // Scenario 4: Async cache warming
        demonstrateAsyncCacheWarming();

        // Scenario 5: Cache with TTL (Time To Live)
        demonstrateCacheWithTTL();

        // Scenario 6: Circuit breaker on data store failure
        demonstrateCircuitBreaker();

        // Scenario 7: Retry logic with exponential backoff
        demonstrateRetryLogic();

        // Scenario 8: Cache eviction policies (LRU)
        demonstrateCacheEviction();

        // Scenario 9: Concurrent cache access
        demonstrateConcurrentAccess();

        // Scenario 10: Cache statistics and monitoring
        demonstrateCacheStatistics();

        System.out.println("\nPattern demonstration complete.");
    }

    /**
     * Scenario 1: Basic cache-aside read-through pattern
     * Demonstrates the fundamental cache-aside operation
     */
    private static void demonstrateBasicCacheAside() {
        System.out.println("--- Scenario 1: Basic Cache-Aside Read-Through ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // First read - cache miss, reads from data store
        String data1 = cache.get("user:1001");
        System.out.println("First read: " + data1);

        // Second read - cache hit, reads from cache
        String data2 = cache.get("user:1001");
        System.out.println("Second read: " + data2);

        System.out.println();
    }

    /**
     * Scenario 2: Handling cache misses and population
     * Shows explicit cache miss handling and population strategy
     */
    private static void demonstrateCacheMissScenario() {
        System.out.println("--- Scenario 2: Cache Miss and Population ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        String[] keys = {"user:1001", "user:1002", "user:1003"};
        for (String key : keys) {
            String value = cache.get(key);
            System.out.println("Retrieved: " + key + " -> " + value);
        }

        System.out.println();
    }

    /**
     * Scenario 3: Cache invalidation on data updates
     * Demonstrates maintaining cache consistency with write-through invalidation
     */
    private static void demonstrateCacheInvalidation() {
        System.out.println("--- Scenario 3: Cache Invalidation on Updates ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // Read and cache data
        String original = cache.get("user:1001");
        System.out.println("Original value: " + original);

        // Update data (invalidates cache)
        cache.update("user:1001", "Updated User Data");
        System.out.println("Updated data in store");

        // Read again - cache miss, reads fresh data
        String updated = cache.get("user:1001");
        System.out.println("After update: " + updated);

        System.out.println();
    }

    /**
     * Scenario 4: Asynchronous cache warming
     * Demonstrates proactive cache population in background
     */
    private static void demonstrateAsyncCacheWarming() throws Exception {
        System.out.println("--- Scenario 4: Async Cache Warming ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // Warm cache asynchronously
        CompletableFuture<Void> warmingTask = cache.warmCacheAsync(
            Arrays.asList("user:1001", "user:1002", "user:1003")
        );

        System.out.println("Cache warming started in background...");
        warmingTask.get(); // Wait for completion
        System.out.println("Cache warming completed");

        // All reads should be cache hits now
        System.out.println("Reading warmed data: " + cache.get("user:1002"));

        System.out.println();
    }

    /**
     * Scenario 5: Cache entries with Time-To-Live
     * Demonstrates automatic cache expiration
     */
    private static void demonstrateCacheWithTTL() throws Exception {
        System.out.println("--- Scenario 5: Cache with TTL ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);
        cache.setDefaultTTL(Duration.ofSeconds(2));

        // Cache data with TTL
        String data = cache.get("user:1001");
        System.out.println("Initial read: " + data);

        // Read within TTL - cache hit
        Thread.sleep(1000);
        System.out.println("Read after 1s: " + cache.get("user:1001") + " (from cache)");

        // Read after TTL expiry - cache miss
        Thread.sleep(1500);
        System.out.println("Read after 2.5s: " + cache.get("user:1001") + " (cache expired)");

        System.out.println();
    }

    /**
     * Scenario 6: Circuit breaker pattern for data store failures
     * Demonstrates resilience when data store is unavailable
     */
    private static void demonstrateCircuitBreaker() {
        System.out.println("--- Scenario 6: Circuit Breaker on Data Store Failure ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // Simulate data store failure
        dataStore.simulateFailure(true);

        // Attempt to read - circuit breaker activates
        try {
            cache.get("user:9999");
        } catch (Exception e) {
            System.out.println("Circuit breaker activated: " + e.getMessage());
        }

        // Restore data store
        dataStore.simulateFailure(false);
        System.out.println("Data store restored");

        System.out.println();
    }

    /**
     * Scenario 7: Retry logic with exponential backoff
     * Demonstrates resilient data retrieval with retries
     */
    private static void demonstrateRetryLogic() {
        System.out.println("--- Scenario 7: Retry Logic with Exponential Backoff ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // Simulate intermittent failures
        dataStore.simulateIntermittentFailure(2); // Fail 2 times then succeed

        String result = cache.getWithRetry("user:1001", 3);
        System.out.println("Retrieved with retries: " + result);

        System.out.println();
    }

    /**
     * Scenario 8: Cache eviction policies (LRU)
     * Demonstrates Least Recently Used eviction strategy
     */
    private static void demonstrateCacheEviction() {
        System.out.println("--- Scenario 8: Cache Eviction (LRU) ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore, 3); // Max 3 entries

        // Fill cache to capacity
        cache.get("user:1001");
        cache.get("user:1002");
        cache.get("user:1003");
        System.out.println("Cache filled with 3 entries");

        // Add one more - should evict LRU entry
        cache.get("user:1004");
        System.out.println("Added 4th entry - LRU evicted");

        // Access user:1002 to make it recently used
        cache.get("user:1002");

        cache.displayCacheContents();

        System.out.println();
    }

    /**
     * Scenario 9: Concurrent cache access
     * Demonstrates thread-safe cache operations under concurrent load
     */
    private static void demonstrateConcurrentAccess() throws Exception {
        System.out.println("--- Scenario 9: Concurrent Cache Access ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        ExecutorService executor = Executors.newFixedThreadPool(5);
        List<CompletableFuture<String>> futures = new ArrayList<>();

        // Simulate concurrent reads
        for (int i = 0; i < 10; i++) {
            int userId = 1001 + (i % 3);
            CompletableFuture<String> future = CompletableFuture.supplyAsync(
                () -> cache.get("user:" + userId),
                executor
            );
            futures.add(future);
        }

        // Wait for all to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();
        System.out.println("Completed 10 concurrent cache operations");

        executor.shutdown();
        System.out.println();
    }

    /**
     * Scenario 10: Cache statistics and monitoring
     * Demonstrates cache performance metrics
     */
    private static void demonstrateCacheStatistics() {
        System.out.println("--- Scenario 10: Cache Statistics and Monitoring ---");

        DataStore dataStore = new DataStore();
        CacheManager cache = new CacheManager(dataStore);

        // Perform various operations
        cache.get("user:1001");
        cache.get("user:1001"); // Hit
        cache.get("user:1002");
        cache.get("user:1001"); // Hit
        cache.get("user:1003");
        cache.get("user:1002"); // Hit

        // Display statistics
        cache.displayStatistics();

        System.out.println();
    }
}

/**
 * Simulated data store (database)
 */
class DataStore {
    private Map<String, String> database = new ConcurrentHashMap<>();
    private boolean failureMode = false;
    private int intermittentFailureCount = 0;

    public DataStore() {
        // Populate with sample data
        database.put("user:1001", "User Data 1001");
        database.put("user:1002", "User Data 1002");
        database.put("user:1003", "User Data 1003");
        database.put("user:1004", "User Data 1004");
    }

    public String read(String key) {
        if (failureMode) {
            throw new RuntimeException("Data store unavailable");
        }

        if (intermittentFailureCount > 0) {
            intermittentFailureCount--;
            throw new RuntimeException("Temporary data store failure");
        }

        // Simulate network latency
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return database.getOrDefault(key, "Not Found");
    }

    public void write(String key, String value) {
        if (failureMode) {
            throw new RuntimeException("Data store unavailable");
        }
        database.put(key, value);
    }

    public void simulateFailure(boolean fail) {
        this.failureMode = fail;
    }

    public void simulateIntermittentFailure(int failureCount) {
        this.intermittentFailureCount = failureCount;
    }
}

/**
 * Cache manager implementing cache-aside pattern with resilience features
 */
class CacheManager {
    private Map<String, CacheEntry> cache = new LinkedHashMap<>(16, 0.75f, true);
    private DataStore dataStore;
    private int maxCacheSize = Integer.MAX_VALUE;
    private Duration defaultTTL = Duration.ofMinutes(10);

    // Statistics
    private int hits = 0;
    private int misses = 0;
    private int evictions = 0;

    public CacheManager(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public CacheManager(DataStore dataStore, int maxCacheSize) {
        this.dataStore = dataStore;
        this.maxCacheSize = maxCacheSize;
    }

    /**
     * Get data using cache-aside pattern
     */
    public synchronized String get(String key) {
        CacheEntry entry = cache.get(key);

        // Check if entry exists and is not expired
        if (entry != null && !entry.isExpired()) {
            hits++;
            System.out.println("  [CACHE HIT] " + key);
            return entry.value;
        }

        // Cache miss - read from data store
        misses++;
        System.out.println("  [CACHE MISS] " + key + " - fetching from data store");
        String value = dataStore.read(key);

        // Populate cache
        putInCache(key, value);

        return value;
    }

    /**
     * Update data and invalidate cache
     */
    public synchronized void update(String key, String value) {
        // Write to data store
        dataStore.write(key, value);

        // Invalidate cache entry
        cache.remove(key);
        System.out.println("  [CACHE INVALIDATED] " + key);
    }

    /**
     * Warm cache asynchronously
     */
    public CompletableFuture<Void> warmCacheAsync(List<String> keys) {
        return CompletableFuture.runAsync(() -> {
            for (String key : keys) {
                get(key);
            }
        });
    }

    /**
     * Get with retry logic and exponential backoff
     */
    public String getWithRetry(String key, int maxRetries) {
        int retries = 0;
        while (retries < maxRetries) {
            try {
                return get(key);
            } catch (Exception e) {
                retries++;
                if (retries >= maxRetries) {
                    throw e;
                }

                long backoffMs = (long) Math.pow(2, retries) * 100;
                System.out.println("  [RETRY] Attempt " + retries + " - backoff " + backoffMs + "ms");

                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }
            }
        }
        throw new RuntimeException("Max retries exceeded");
    }

    /**
     * Put entry in cache with eviction logic
     */
    private void putInCache(String key, String value) {
        // Check if eviction needed
        if (cache.size() >= maxCacheSize && !cache.containsKey(key)) {
            // Remove least recently used (first entry in LinkedHashMap with access order)
            Iterator<String> it = cache.keySet().iterator();
            if (it.hasNext()) {
                String lruKey = it.next();
                it.remove();
                evictions++;
                System.out.println("  [EVICTED] " + lruKey + " (LRU)");
            }
        }

        cache.put(key, new CacheEntry(value, Instant.now().plus(defaultTTL)));
    }

    public void setDefaultTTL(Duration ttl) {
        this.defaultTTL = ttl;
    }

    public void displayCacheContents() {
        System.out.println("  Current cache contents: " + cache.keySet());
    }

    public void displayStatistics() {
        int total = hits + misses;
        double hitRate = total > 0 ? (double) hits / total * 100 : 0;

        System.out.println("  Cache Statistics:");
        System.out.println("    Total Requests: " + total);
        System.out.println("    Hits: " + hits);
        System.out.println("    Misses: " + misses);
        System.out.println("    Hit Rate: " + String.format("%.2f%%", hitRate));
        System.out.println("    Evictions: " + evictions);
        System.out.println("    Current Size: " + cache.size());
    }
}

/**
 * Cache entry with expiration time
 */
class CacheEntry {
    String value;
    Instant expiryTime;

    public CacheEntry(String value, Instant expiryTime) {
        this.value = value;
        this.expiryTime = expiryTime;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiryTime);
    }
}
