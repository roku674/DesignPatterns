using System.Threading.Tasks;

namespace Decorator;

/// <summary>
/// Base decorator class that maintains a reference to a component object.
/// Implements IDataStream by delegating to the wrapped component.
/// </summary>
public abstract class StreamDecorator : IDataStream
{
    protected readonly IDataStream _wrappedStream;

    protected StreamDecorator(IDataStream wrappedStream)
    {
        _wrappedStream = wrappedStream ?? throw new ArgumentNullException(nameof(wrappedStream));
    }

    public virtual async Task WriteAsync(string data)
    {
        await _wrappedStream.WriteAsync(data);
    }

    public virtual async Task<string> ReadAsync()
    {
        return await _wrappedStream.ReadAsync();
    }

    public virtual async Task FlushAsync()
    {
        await _wrappedStream.FlushAsync();
    }

    public virtual async Task CloseAsync()
    {
        await _wrappedStream.CloseAsync();
    }

    public virtual long GetSize()
    {
        return _wrappedStream.GetSize();
    }

    public virtual string GetStreamInfo()
    {
        return _wrappedStream.GetStreamInfo();
    }
}
