using System.Threading.Tasks;
using System.Collections.Generic;
using System.Diagnostics;

namespace Proxy;

/// <summary>
/// Proxy that adds caching functionality.
/// Demonstrates the Protection/Virtual Proxy patterns combined.
/// </summary>
public class CachingProxy : IDataProvider
{
    private readonly Lazy<ExpensiveDataProvider> _realSubject;
    private readonly Dictionary<string, CacheEntry> _cache = new Dictionary<string, CacheEntry>();
    private readonly int _cacheTtlMs;
    private long _proxyOperationCount = 0;
    private long _cacheHits = 0;
    private long _cacheMisses = 0;

    public CachingProxy(int cacheTtlMs = 5000)
    {
        _cacheTtlMs = cacheTtlMs;
        _realSubject = new Lazy<ExpensiveDataProvider>(() =>
        {
            Console.WriteLine("[Proxy] Lazy loading RealSubject on first access");
            return new ExpensiveDataProvider();
        });

        Console.WriteLine($"[Proxy] CachingProxy created (cache TTL: {cacheTtlMs}ms, lazy loading enabled)");
    }

    public async Task<string> GetDataAsync(string key)
    {
        _proxyOperationCount++;
        Console.WriteLine($"\n[Proxy] GET request for key: {key}");

        // Check cache first
        if (_cache.ContainsKey(key))
        {
            CacheEntry entry = _cache[key];
            long age = (DateTime.UtcNow.Ticks - entry.Timestamp) / TimeSpan.TicksPerMillisecond;

            if (age < _cacheTtlMs)
            {
                _cacheHits++;
                Console.WriteLine($"[Proxy] Cache HIT (age: {age}ms, hits: {_cacheHits})");
                return entry.Value;
            }
            else
            {
                Console.WriteLine($"[Proxy] Cache EXPIRED (age: {age}ms)");
                _cache.Remove(key);
            }
        }

        // Cache miss - fetch from real subject
        _cacheMisses++;
        Console.WriteLine($"[Proxy] Cache MISS (misses: {_cacheMisses}) - forwarding to RealSubject");

        Stopwatch sw = Stopwatch.StartNew();
        string value = await _realSubject.Value.GetDataAsync(key);
        sw.Stop();

        // Cache the result
        if (!string.IsNullOrEmpty(value))
        {
            _cache[key] = new CacheEntry { Value = value, Timestamp = DateTime.UtcNow.Ticks };
            Console.WriteLine($"[Proxy] Cached result (took {sw.ElapsedMilliseconds}ms)");
        }

        return value;
    }

    public async Task<List<string>> GetAllKeysAsync()
    {
        _proxyOperationCount++;
        Console.WriteLine($"\n[Proxy] GET ALL KEYS request");

        // This operation is not cached - always forward
        Console.WriteLine($"[Proxy] Forwarding to RealSubject");
        return await _realSubject.Value.GetAllKeysAsync();
    }

    public async Task SetDataAsync(string key, string value)
    {
        _proxyOperationCount++;
        Console.WriteLine($"\n[Proxy] SET request for key: {key}");

        // Write-through: update real subject first
        await _realSubject.Value.SetDataAsync(key, value);

        // Update cache
        _cache[key] = new CacheEntry { Value = value, Timestamp = DateTime.UtcNow.Ticks };
        Console.WriteLine($"[Proxy] Updated cache for key: {key}");
    }

    public async Task<bool> DeleteDataAsync(string key)
    {
        _proxyOperationCount++;
        Console.WriteLine($"\n[Proxy] DELETE request for key: {key}");

        // Delete from real subject
        bool deleted = await _realSubject.Value.DeleteDataAsync(key);

        // Invalidate cache
        if (_cache.Remove(key))
        {
            Console.WriteLine($"[Proxy] Invalidated cache for key: {key}");
        }

        return deleted;
    }

    public long GetOperationCount()
    {
        return _proxyOperationCount;
    }

    public ProxyStats GetStats()
    {
        long realSubjectOps = _realSubject.IsValueCreated ? _realSubject.Value.GetOperationCount() : 0;

        return new ProxyStats
        {
            ProxyOperations = _proxyOperationCount,
            RealSubjectOperations = realSubjectOps,
            CacheHits = _cacheHits,
            CacheMisses = _cacheMisses,
            CacheSize = _cache.Count,
            HitRate = _proxyOperationCount > 0 ? (_cacheHits / (double)_proxyOperationCount) * 100 : 0,
            RealSubjectLoaded = _realSubject.IsValueCreated
        };
    }

    public void ClearCache()
    {
        int count = _cache.Count;
        _cache.Clear();
        Console.WriteLine($"[Proxy] Cleared {count} cache entries");
    }

    private class CacheEntry
    {
        public string Value { get; set; } = string.Empty;
        public long Timestamp { get; set; }
    }
}

public class ProxyStats
{
    public long ProxyOperations { get; set; }
    public long RealSubjectOperations { get; set; }
    public long CacheHits { get; set; }
    public long CacheMisses { get; set; }
    public int CacheSize { get; set; }
    public double HitRate { get; set; }
    public bool RealSubjectLoaded { get; set; }
}
