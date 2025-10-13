using System;
using System.Threading;
using System.Threading.Tasks;

namespace Concurrency.DoubleCheckedLockingOptimization;

/// <summary>
/// Concrete implementation of DoubleCheckedLockingOptimization pattern.
/// Reduces locking overhead by checking the condition before acquiring the lock,
/// and then checking again after acquiring it.
/// </summary>
public class DoubleCheckedLockingOptimizationImplementation : IDoubleCheckedLockingOptimization
{
    public void Execute()
    {
        Console.WriteLine("DoubleCheckedLockingOptimization pattern executing...");
        Console.WriteLine();

        // Demonstrate double-checked locking with a resource manager
        Console.WriteLine("=== Resource Manager Example ===");
        ResourceManager manager = ResourceManager.Instance;
        manager.UseResource();

        Console.WriteLine();
        Console.WriteLine("=== Testing Thread Safety ===");
        TestThreadSafety();

        Console.WriteLine();
        Console.WriteLine("=== Configuration Manager Example ===");
        ConfigurationCache configCache = ConfigurationCache.Instance;
        configCache.GetConfiguration("database.url");
        configCache.GetConfiguration("api.key");
    }

    /// <summary>
    /// Tests thread safety by attempting to access singleton from multiple threads.
    /// </summary>
    private void TestThreadSafety()
    {
        const int threadCount = 10;
        Task[] tasks = new Task[threadCount];

        Console.WriteLine($"Creating {threadCount} threads to access ResourceManager...");

        for (int i = 0; i < threadCount; i++)
        {
            int threadId = i;
            tasks[i] = Task.Run(() =>
            {
                ResourceManager instance = ResourceManager.Instance;
                Console.WriteLine($"Thread {threadId}: Got instance with hash {instance.GetHashCode()}");
            });
        }

        Task.WaitAll(tasks);
        Console.WriteLine("All threads completed. All should have the same instance hash code.");
    }
}

/// <summary>
/// Example: Thread-safe resource manager using double-checked locking.
/// Uses volatile to ensure proper memory barriers.
/// </summary>
public sealed class ResourceManager
{
    // Volatile ensures that assignment to _instance is visible to all threads
    private static volatile ResourceManager? _instance;
    private static readonly object _lock = new object();

    private readonly DateTime _createdAt;
    private int _usageCount;

    /// <summary>
    /// Gets the singleton instance using double-checked locking pattern.
    /// </summary>
    public static ResourceManager Instance
    {
        get
        {
            // First check (without locking for performance)
            // This avoids the overhead of acquiring a lock on every access
            if (_instance == null)
            {
                // Lock to ensure thread safety during initialization
                lock (_lock)
                {
                    // Second check (after acquiring lock)
                    // This ensures only one thread creates the instance
                    if (_instance == null)
                    {
                        Console.WriteLine("ResourceManager: Creating new instance...");
                        _instance = new ResourceManager();
                    }
                }
            }

            return _instance;
        }
    }

    /// <summary>
    /// Private constructor prevents external instantiation.
    /// </summary>
    private ResourceManager()
    {
        _createdAt = DateTime.Now;
        _usageCount = 0;
        Console.WriteLine($"ResourceManager: Instance created at {_createdAt}");
    }

    /// <summary>
    /// Example method that uses the resource.
    /// </summary>
    public void UseResource()
    {
        Interlocked.Increment(ref _usageCount);
        Console.WriteLine($"ResourceManager: Resource used {_usageCount} times");
    }
}

/// <summary>
/// Example: Configuration cache with lazy initialization using double-checked locking.
/// Demonstrates the pattern for initializing expensive resources.
/// </summary>
public sealed class ConfigurationCache
{
    private static volatile ConfigurationCache? _instance;
    private static readonly object _lock = new object();

    private readonly System.Collections.Generic.Dictionary<string, string> _cache;

    /// <summary>
    /// Gets the singleton instance.
    /// </summary>
    public static ConfigurationCache Instance
    {
        get
        {
            // First check (no lock) - fast path for already initialized instance
            if (_instance == null)
            {
                // Acquire lock for initialization
                lock (_lock)
                {
                    // Second check (with lock) - ensures single initialization
                    if (_instance == null)
                    {
                        Console.WriteLine("ConfigurationCache: Initializing expensive cache...");
                        Thread.Sleep(100); // Simulate expensive initialization
                        _instance = new ConfigurationCache();
                    }
                }
            }

            return _instance;
        }
    }

    /// <summary>
    /// Private constructor loads configuration.
    /// </summary>
    private ConfigurationCache()
    {
        _cache = new System.Collections.Generic.Dictionary<string, string>
        {
            { "database.url", "localhost:5432" },
            { "api.key", "secret-key-12345" },
            { "cache.timeout", "300" }
        };
        Console.WriteLine("ConfigurationCache: Cache initialized with 3 entries");
    }

    /// <summary>
    /// Gets a configuration value from the cache.
    /// </summary>
    public string GetConfiguration(string key)
    {
        if (_cache.TryGetValue(key, out string? value))
        {
            Console.WriteLine($"ConfigurationCache: Retrieved '{key}' = '{value}'");
            return value;
        }

        Console.WriteLine($"ConfigurationCache: Key '{key}' not found");
        return string.Empty;
    }
}
