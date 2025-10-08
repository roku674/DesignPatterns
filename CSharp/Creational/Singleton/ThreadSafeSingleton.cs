namespace Singleton;

/// <summary>
/// Alternative thread-safe Singleton implementation using double-check locking.
/// This approach is useful when you need more control over initialization.
/// Note: Lazy<T> (used in other examples) is generally preferred in modern C#.
/// </summary>
public sealed class ThreadSafeSingleton
{
    private static ThreadSafeSingleton? _instance;
    private static readonly object _lock = new object();

    /// <summary>
    /// Gets the singleton instance using double-check locking pattern.
    /// </summary>
    public static ThreadSafeSingleton Instance
    {
        get
        {
            // First check (without locking for performance)
            if (_instance == null)
            {
                // Lock to ensure thread safety
                lock (_lock)
                {
                    // Second check (after acquiring lock)
                    if (_instance == null)
                    {
                        _instance = new ThreadSafeSingleton();
                    }
                }
            }

            return _instance;
        }
    }

    /// <summary>
    /// Private constructor prevents external instantiation.
    /// </summary>
    private ThreadSafeSingleton()
    {
        Console.WriteLine("ThreadSafeSingleton: Instance created with double-check locking");
    }

    /// <summary>
    /// Example business logic method.
    /// </summary>
    public void DoSomething()
    {
        Console.WriteLine("ThreadSafeSingleton: Executing thread-safe operation");
    }
}
