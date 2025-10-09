using System.Collections.Concurrent;

namespace Singleton;

/// <summary>
/// Production-ready Logger as a Singleton with thread-safe file operations.
/// Ensures all log messages go through a single, centralized logger instance.
/// Uses async I/O for real file writing operations.
/// </summary>
public sealed class Logger : IDisposable
{
    private static readonly Lazy<Logger> _instance =
        new Lazy<Logger>(() => new Logger(), LazyThreadSafetyMode.ExecutionAndPublication);

    public static Logger Instance => _instance.Value;

    private readonly string _logFilePath;
    private readonly StreamWriter _fileWriter;
    private readonly ConcurrentQueue<string> _logQueue;
    private readonly SemaphoreSlim _writeSemaphore;
    private readonly object _disposeLock = new object();
    private bool _disposed = false;
    private readonly Task _writeTask;
    private readonly CancellationTokenSource _cancellationTokenSource;

    /// <summary>
    /// Private constructor initializes the logger with real file I/O.
    /// </summary>
    private Logger()
    {
        string logDirectory = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logs");
        if (!Directory.Exists(logDirectory))
        {
            Directory.CreateDirectory(logDirectory);
        }

        _logFilePath = Path.Combine(logDirectory, $"application_{DateTime.Now:yyyyMMdd}.log");
        _fileWriter = new StreamWriter(_logFilePath, append: true, encoding: System.Text.Encoding.UTF8)
        {
            AutoFlush = false // Manual flush for performance
        };

        _logQueue = new ConcurrentQueue<string>();
        _writeSemaphore = new SemaphoreSlim(0);
        _cancellationTokenSource = new CancellationTokenSource();

        // Start background task for writing logs
        _writeTask = Task.Run(ProcessLogQueueAsync, _cancellationTokenSource.Token);
    }

    /// <summary>
    /// Logs an informational message asynchronously.
    /// </summary>
    public async Task LogInfoAsync(string message)
    {
        await LogAsync("INFO", message);
    }

    /// <summary>
    /// Logs a warning message asynchronously.
    /// </summary>
    public async Task LogWarningAsync(string message)
    {
        await LogAsync("WARNING", message);
    }

    /// <summary>
    /// Logs an error message asynchronously.
    /// </summary>
    public async Task LogErrorAsync(string message, Exception? exception = null)
    {
        string fullMessage = exception != null
            ? $"{message}\nException: {exception.GetType().Name}\nMessage: {exception.Message}\nStackTrace:\n{exception.StackTrace}"
            : message;
        await LogAsync("ERROR", fullMessage);
    }

    /// <summary>
    /// Core logging method with thread-safe file operations.
    /// </summary>
    private async Task LogAsync(string level, string message)
    {
        if (_disposed)
        {
            throw new ObjectDisposedException(nameof(Logger));
        }

        string logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] [{level}] {message}";
        _logQueue.Enqueue(logEntry);
        _writeSemaphore.Release();

        // Also write to console for visibility
        Console.WriteLine(logEntry);

        await Task.CompletedTask;
    }

    /// <summary>
    /// Background task that processes the log queue and writes to file.
    /// </summary>
    private async Task ProcessLogQueueAsync()
    {
        while (!_cancellationTokenSource.Token.IsCancellationRequested)
        {
            try
            {
                await _writeSemaphore.WaitAsync(_cancellationTokenSource.Token);

                if (_logQueue.TryDequeue(out string? logEntry))
                {
                    await _fileWriter.WriteLineAsync(logEntry);
                    await _fileWriter.FlushAsync();
                }
            }
            catch (OperationCanceledException)
            {
                // Expected when shutting down
                break;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Logger error: {ex.Message}");
            }
        }

        // Flush remaining logs
        while (_logQueue.TryDequeue(out string? logEntry))
        {
            await _fileWriter.WriteLineAsync(logEntry);
        }
        await _fileWriter.FlushAsync();
    }

    /// <summary>
    /// Gets the current log file path.
    /// </summary>
    public string GetLogFilePath() => _logFilePath;

    /// <summary>
    /// Reads all log entries from the file.
    /// </summary>
    public async Task<List<string>> ReadAllLogsAsync()
    {
        await _fileWriter.FlushAsync();

        List<string> logs = new List<string>();
        using (FileStream fs = new FileStream(_logFilePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        using (StreamReader reader = new StreamReader(fs))
        {
            string? line;
            while ((line = await reader.ReadLineAsync()) != null)
            {
                logs.Add(line);
            }
        }
        return logs;
    }

    /// <summary>
    /// Disposes resources and ensures all logs are written.
    /// </summary>
    public void Dispose()
    {
        lock (_disposeLock)
        {
            if (_disposed) return;
            _disposed = true;
        }

        _cancellationTokenSource.Cancel();
        _writeTask.Wait(TimeSpan.FromSeconds(5));

        _fileWriter.Dispose();
        _writeSemaphore.Dispose();
        _cancellationTokenSource.Dispose();
    }
}
