namespace Singleton;

/// <summary>
/// Basic thread-safe Singleton implementation using lazy initialization.
/// This is the recommended approach for most scenarios in modern C#.
/// </summary>
public sealed class BasicSingleton
{
    // Lazy<T> provides thread-safe lazy initialization
    private static readonly Lazy<BasicSingleton> _instance =
        new Lazy<BasicSingleton>(() => new BasicSingleton());

    /// <summary>
    /// Gets the singleton instance.
    /// </summary>
    public static BasicSingleton Instance => _instance.Value;

    /// <summary>
    /// Private constructor prevents external instantiation.
    /// </summary>
    private BasicSingleton()
    {
        Console.WriteLine("BasicSingleton instance created");
    }

    /// <summary>
    /// Example business logic method.
    /// </summary>
    public void DoSomething()
    {
        Console.WriteLine("BasicSingleton: Executing business logic");
    }
}
