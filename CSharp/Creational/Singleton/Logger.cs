namespace Singleton;

/// <summary>
/// Real-world example: Application Logger as a Singleton.
/// Ensures all log messages go through a single, centralized logger instance.
/// </summary>
public sealed class Logger
{
    private static readonly Lazy<Logger> _instance =
        new Lazy<Logger>(() => new Logger());

    public static Logger Instance => _instance.Value;

    private readonly List<string> _logs;
    private readonly string _logFilePath;

    /// <summary>
    /// Private constructor initializes the logger.
    /// </summary>
    private Logger()
    {
        _logs = new List<string>();
        _logFilePath = "application.log";
        Console.WriteLine($"Logger: Initialized with log file: {_logFilePath}");
    }

    /// <summary>
    /// Logs an informational message.
    /// </summary>
    public void LogInfo(string message)
    {
        string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [INFO] {message}";
        _logs.Add(logEntry);
        Console.WriteLine($"Logger: {logEntry}");
    }

    /// <summary>
    /// Logs a warning message.
    /// </summary>
    public void LogWarning(string message)
    {
        string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [WARNING] {message}";
        _logs.Add(logEntry);
        Console.WriteLine($"Logger: {logEntry}");
    }

    /// <summary>
    /// Logs an error message.
    /// </summary>
    public void LogError(string message)
    {
        string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [ERROR] {message}";
        _logs.Add(logEntry);
        Console.WriteLine($"Logger: {logEntry}");
    }

    /// <summary>
    /// Gets the total number of log entries.
    /// </summary>
    public int GetLogCount()
    {
        return _logs.Count;
    }

    /// <summary>
    /// Displays all log entries.
    /// </summary>
    public void DisplayAllLogs()
    {
        Console.WriteLine("\n=== All Log Entries ===");
        foreach (string log in _logs)
        {
            Console.WriteLine(log);
        }
        Console.WriteLine($"Total entries: {_logs.Count}\n");
    }
}
