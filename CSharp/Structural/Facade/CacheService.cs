using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace Facade;

/// <summary>
/// Complex subsystem component - Caching layer with TTL.
/// </summary>
public class CacheService
{
    private readonly ConcurrentDictionary<string, CacheEntry> _cache = new ConcurrentDictionary<string, CacheEntry>();
    private readonly int _ttlSeconds;

    public CacheService(int ttlSeconds = 300)
    {
        _ttlSeconds = ttlSeconds;
    }

    public async Task<T?> GetAsync<T>(string key) where T : class
    {
        await Task.Delay(5); // Simulate cache lookup latency

        if (_cache.TryGetValue(key, out CacheEntry? entry))
        {
            if (DateTime.UtcNow < entry.ExpirationTime)
            {
                Console.WriteLine($"[CacheService] Cache HIT for key: {key}");
                return entry.Value as T;
            }
            else
            {
                _cache.TryRemove(key, out _);
                Console.WriteLine($"[CacheService] Cache EXPIRED for key: {key}");
            }
        }

        Console.WriteLine($"[CacheService] Cache MISS for key: {key}");
        return null;
    }

    public async Task SetAsync<T>(string key, T value) where T : class
    {
        await Task.Delay(5); // Simulate cache write latency

        CacheEntry entry = new CacheEntry
        {
            Value = value,
            ExpirationTime = DateTime.UtcNow.AddSeconds(_ttlSeconds)
        };

        _cache[key] = entry;
        Console.WriteLine($"[CacheService] Cached key: {key} (TTL: {_ttlSeconds}s)");
    }

    public async Task InvalidateAsync(string key)
    {
        await Task.Delay(5);
        bool removed = _cache.TryRemove(key, out _);
        Console.WriteLine($"[CacheService] Invalidated key: {key} - {(removed ? "Success" : "Not Found")}");
    }

    public async Task ClearAsync()
    {
        await Task.Delay(5);
        int count = _cache.Count;
        _cache.Clear();
        Console.WriteLine($"[CacheService] Cleared {count} cache entries");
    }

    public int GetCacheSize()
    {
        return _cache.Count;
    }

    private class CacheEntry
    {
        public object Value { get; set; } = new object();
        public DateTime ExpirationTime { get; set; }
    }
}
