using System.Threading.Tasks;
using System.Text;

namespace Decorator;

/// <summary>
/// Concrete decorator that adds buffering functionality.
/// Accumulates writes and flushes in batches for better performance.
/// </summary>
public class BufferingDecorator : StreamDecorator
{
    private readonly StringBuilder _buffer;
    private readonly int _bufferSize;
    private int _bytesBuffered = 0;

    public BufferingDecorator(IDataStream wrappedStream, int bufferSize = 1024) : base(wrappedStream)
    {
        _buffer = new StringBuilder();
        _bufferSize = bufferSize;
        Console.WriteLine($"[Buffering] Initialized with buffer size: {_bufferSize} bytes");
    }

    public override async Task WriteAsync(string data)
    {
        _buffer.Append(data);
        _bytesBuffered += Encoding.UTF8.GetByteCount(data);

        Console.WriteLine($"[Buffering] Added {data.Length} characters to buffer (total buffered: {_bytesBuffered} bytes)");

        if (_bytesBuffered >= _bufferSize)
        {
            await FlushBufferAsync();
        }
    }

    public override async Task<string> ReadAsync()
    {
        // Flush any pending writes before reading
        if (_bytesBuffered > 0)
        {
            await FlushBufferAsync();
        }

        return await _wrappedStream.ReadAsync();
    }

    public override async Task FlushAsync()
    {
        await FlushBufferAsync();
        await _wrappedStream.FlushAsync();
    }

    public override async Task CloseAsync()
    {
        if (_bytesBuffered > 0)
        {
            Console.WriteLine($"[Buffering] Flushing {_bytesBuffered} buffered bytes before close");
            await FlushBufferAsync();
        }

        await _wrappedStream.CloseAsync();
    }

    public override string GetStreamInfo()
    {
        return $"Buffered({_bufferSize})({_wrappedStream.GetStreamInfo()})";
    }

    private async Task FlushBufferAsync()
    {
        if (_bytesBuffered == 0)
        {
            return;
        }

        string data = _buffer.ToString();
        Console.WriteLine($"[Buffering] Flushing buffer: {_bytesBuffered} bytes");

        await _wrappedStream.WriteAsync(data);

        _buffer.Clear();
        _bytesBuffered = 0;
    }
}
