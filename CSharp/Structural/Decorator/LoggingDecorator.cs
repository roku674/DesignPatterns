using System.Threading.Tasks;
using System.Diagnostics;

namespace Decorator;

/// <summary>
/// Concrete decorator that adds logging and performance monitoring.
/// Demonstrates how decorators can add cross-cutting concerns.
/// </summary>
public class LoggingDecorator : StreamDecorator
{
    private readonly string _logPrefix;
    private int _writeCount = 0;
    private int _readCount = 0;

    public LoggingDecorator(IDataStream wrappedStream, string logPrefix = "Stream") : base(wrappedStream)
    {
        _logPrefix = logPrefix;
        Console.WriteLine($"[Logging] Initialized for {_logPrefix}");
    }

    public override async Task WriteAsync(string data)
    {
        _writeCount++;
        Stopwatch sw = Stopwatch.StartNew();

        Console.WriteLine($"[Logging:{_logPrefix}] Write operation #{_writeCount} started - data length: {data.Length}");

        await _wrappedStream.WriteAsync(data);

        sw.Stop();
        Console.WriteLine($"[Logging:{_logPrefix}] Write operation #{_writeCount} completed in {sw.ElapsedMilliseconds}ms");
    }

    public override async Task<string> ReadAsync()
    {
        _readCount++;
        Stopwatch sw = Stopwatch.StartNew();

        Console.WriteLine($"[Logging:{_logPrefix}] Read operation #{_readCount} started");

        string result = await _wrappedStream.ReadAsync();

        sw.Stop();
        Console.WriteLine($"[Logging:{_logPrefix}] Read operation #{_readCount} completed in {sw.ElapsedMilliseconds}ms - data length: {result.Length}");

        return result;
    }

    public override async Task FlushAsync()
    {
        Console.WriteLine($"[Logging:{_logPrefix}] Flush operation started");
        await _wrappedStream.FlushAsync();
        Console.WriteLine($"[Logging:{_logPrefix}] Flush operation completed");
    }

    public override async Task CloseAsync()
    {
        Console.WriteLine($"[Logging:{_logPrefix}] Close operation - Total writes: {_writeCount}, Total reads: {_readCount}");
        await _wrappedStream.CloseAsync();
        Console.WriteLine($"[Logging:{_logPrefix}] Stream closed");
    }

    public override string GetStreamInfo()
    {
        return $"Logged[{_logPrefix}]({_wrappedStream.GetStreamInfo()})";
    }
}
