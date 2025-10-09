using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace Proxy;

/// <summary>
/// Demonstrates REAL Proxy pattern with caching, lazy loading, and access control.
/// Shows how proxies can add functionality transparently.
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== REAL Proxy Pattern Demo ===");
        Console.WriteLine("Production-Ready Proxy Patterns\n");

        // Example 1: Lazy Loading Proxy
        Console.WriteLine("--- Scenario 1: Lazy Loading (Virtual Proxy) ---\n");
        await DemoLazyLoading();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 2: Caching Proxy
        Console.WriteLine("--- Scenario 2: Caching Proxy with Performance Improvement ---\n");
        await DemoCaching();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 3: Protection Proxy
        Console.WriteLine("--- Scenario 3: Protection Proxy with Access Control ---\n");
        await DemoProtection();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 4: Combined Proxies
        Console.WriteLine("--- Scenario 4: Stacked Proxies (Protection + Caching) ---\n");
        await DemoStackedProxies();

        Console.WriteLine("\n" + new string('=', 70) + "\n");

        // Example 5: Performance Comparison
        Console.WriteLine("--- Scenario 5: Performance Comparison ---\n");
        await DemoPerformanceComparison();

        Console.WriteLine("\n" + new string('=', 70));
        Console.WriteLine("\nProxy pattern provides:");
        Console.WriteLine("  ✓ Lazy initialization (Virtual Proxy)");
        Console.WriteLine("  ✓ Access control (Protection Proxy)");
        Console.WriteLine("  ✓ Caching and performance optimization");
        Console.WriteLine("  ✓ Transparent wrapper around real object");
        Console.WriteLine("  ✓ Additional functionality without modifying real subject");
        Console.WriteLine("  ✓ Control over object lifecycle and resource usage");
    }

    private static async Task DemoLazyLoading()
    {
        Console.WriteLine("Creating CachingProxy (RealSubject NOT yet created)...\n");
        CachingProxy proxy = new CachingProxy();

        ProxyStats stats1 = proxy.GetStats();
        Console.WriteLine($"RealSubject loaded: {stats1.RealSubjectLoaded}");

        Console.WriteLine("\nNow accessing data through proxy...");
        string value = await proxy.GetDataAsync("user:1");
        Console.WriteLine($"Retrieved value: {value}");

        ProxyStats stats2 = proxy.GetStats();
        Console.WriteLine($"\nRealSubject loaded: {stats2.RealSubjectLoaded} (lazy loaded on first access)");
    }

    private static async Task DemoCaching()
    {
        CachingProxy proxy = new CachingProxy(cacheTtlMs: 3000);

        // First access - cache miss
        Stopwatch sw1 = Stopwatch.StartNew();
        string value1 = await proxy.GetDataAsync("product:1");
        sw1.Stop();
        Console.WriteLine($"First access result: {value1} (took {sw1.ElapsedMilliseconds}ms)");

        // Second access - cache hit
        Stopwatch sw2 = Stopwatch.StartNew();
        string value2 = await proxy.GetDataAsync("product:1");
        sw2.Stop();
        Console.WriteLine($"Second access result: {value2} (took {sw2.ElapsedMilliseconds}ms)");

        Console.WriteLine($"\nSpeed improvement: {sw1.ElapsedMilliseconds / (double)Math.Max(1, sw2.ElapsedMilliseconds):F1}x faster!");

        ProxyStats stats = proxy.GetStats();
        Console.WriteLine($"\nProxy Statistics:");
        Console.WriteLine($"  Proxy Operations: {stats.ProxyOperations}");
        Console.WriteLine($"  RealSubject Operations: {stats.RealSubjectOperations}");
        Console.WriteLine($"  Cache Hits: {stats.CacheHits}");
        Console.WriteLine($"  Cache Misses: {stats.CacheMisses}");
        Console.WriteLine($"  Hit Rate: {stats.HitRate:F1}%");
        Console.WriteLine($"  Cache Size: {stats.CacheSize}");
    }

    private static async Task DemoProtection()
    {
        Console.WriteLine("Testing different user roles:\n");

        // Admin user - full access
        Console.WriteLine("1. Admin User:");
        ExpensiveDataProvider realProvider1 = new ExpensiveDataProvider();
        ProtectionProxy adminProxy = new ProtectionProxy(realProvider1, "Admin");

        try
        {
            await adminProxy.GetDataAsync("user:1");
            await adminProxy.SetDataAsync("test:key", "test value");
            await adminProxy.DeleteDataAsync("test:key");
            Console.WriteLine("  All operations succeeded\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  Error: {ex.Message}\n");
        }

        // Regular user - read/write but no delete
        Console.WriteLine("2. Regular User:");
        ExpensiveDataProvider realProvider2 = new ExpensiveDataProvider();
        ProtectionProxy userProxy = new ProtectionProxy(realProvider2, "User");

        try
        {
            await userProxy.GetDataAsync("user:1");
            await userProxy.SetDataAsync("test:key", "test value");
            Console.WriteLine("  Read and Write succeeded");

            await userProxy.DeleteDataAsync("test:key");
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"  Delete denied: {ex.Message}\n");
        }

        // Guest user - no access
        Console.WriteLine("3. Guest User:");
        ExpensiveDataProvider realProvider3 = new ExpensiveDataProvider();
        ProtectionProxy guestProxy = new ProtectionProxy(realProvider3, "Guest");

        try
        {
            await guestProxy.GetDataAsync("user:1");
        }
        catch (UnauthorizedAccessException ex)
        {
            Console.WriteLine($"  Read denied: {ex.Message}");
        }

        Console.WriteLine($"\n  Denied operations: {guestProxy.GetDeniedOperations()}");
    }

    private static async Task DemoStackedProxies()
    {
        Console.WriteLine("Creating stacked proxies: ProtectionProxy -> CachingProxy -> RealSubject\n");

        CachingProxy cachingProxy = new CachingProxy();
        ProtectionProxy protectionProxy = new ProtectionProxy(cachingProxy, "Admin");

        // Access through stacked proxies
        Console.WriteLine("First access:");
        string value1 = await protectionProxy.GetDataAsync("user:1");
        Console.WriteLine($"Result: {value1}");

        Console.WriteLine("\nSecond access (should use cache):");
        string value2 = await protectionProxy.GetDataAsync("user:1");
        Console.WriteLine($"Result: {value2}");

        Console.WriteLine("\nBoth protection AND caching are working!");

        ProxyStats stats = cachingProxy.GetStats();
        Console.WriteLine($"\nCaching Stats:");
        Console.WriteLine($"  Cache Hits: {stats.CacheHits}");
        Console.WriteLine($"  Hit Rate: {stats.HitRate:F1}%");
    }

    private static async Task DemoPerformanceComparison()
    {
        Console.WriteLine("Comparing performance: Direct vs Proxy\n");

        // Direct access (no proxy)
        Console.WriteLine("1. Direct Access (no caching):");
        ExpensiveDataProvider direct = new ExpensiveDataProvider();

        Stopwatch swDirect = Stopwatch.StartNew();
        for (int i = 0; i < 10; i++)
        {
            await direct.GetDataAsync("user:1");
        }
        swDirect.Stop();

        Console.WriteLine($"   10 operations took: {swDirect.ElapsedMilliseconds}ms");

        // Proxy access (with caching)
        Console.WriteLine("\n2. Proxy Access (with caching):");
        CachingProxy proxy = new CachingProxy();

        Stopwatch swProxy = Stopwatch.StartNew();
        for (int i = 0; i < 10; i++)
        {
            await proxy.GetDataAsync("user:1");
        }
        swProxy.Stop();

        Console.WriteLine($"   10 operations took: {swProxy.ElapsedMilliseconds}ms");

        ProxyStats stats = proxy.GetStats();
        Console.WriteLine($"\n   Cache hit rate: {stats.HitRate:F1}%");
        Console.WriteLine($"   Speed improvement: {swDirect.ElapsedMilliseconds / (double)swProxy.ElapsedMilliseconds:F1}x faster");
        Console.WriteLine($"   Time saved: {swDirect.ElapsedMilliseconds - swProxy.ElapsedMilliseconds}ms");
    }
}
