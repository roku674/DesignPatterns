using System.Threading.Tasks;

namespace Facade;

/// <summary>
/// Complex subsystem component - Logging infrastructure.
/// </summary>
public class LoggingService
{
    private readonly List<LogEntry> _logs = new List<LogEntry>();

    public async Task LogInfoAsync(string message)
    {
        await LogAsync(LogLevel.Info, message);
    }

    public async Task LogWarningAsync(string message)
    {
        await LogAsync(LogLevel.Warning, message);
    }

    public async Task LogErrorAsync(string message)
    {
        await LogAsync(LogLevel.Error, message);
    }

    private async Task LogAsync(LogLevel level, string message)
    {
        await Task.Delay(2); // Simulate I/O operation

        LogEntry entry = new LogEntry
        {
            Timestamp = DateTime.UtcNow,
            Level = level,
            Message = message
        };

        _logs.Add(entry);

        string levelStr = level.ToString().ToUpper();
        Console.WriteLine($"[LoggingService] [{levelStr}] {message}");
    }

    public List<LogEntry> GetLogs()
    {
        return new List<LogEntry>(_logs);
    }

    public void ClearLogs()
    {
        _logs.Clear();
        Console.WriteLine("[LoggingService] Logs cleared");
    }
}

public enum LogLevel
{
    Info,
    Warning,
    Error
}

public class LogEntry
{
    public DateTime Timestamp { get; set; }
    public LogLevel Level { get; set; }
    public string Message { get; set; } = string.Empty;
}
