using System.Threading.Tasks;

namespace Decorator;

/// <summary>
/// Component interface for data streams.
/// Defines operations that can be decorated with additional functionality.
/// </summary>
public interface IDataStream
{
    Task WriteAsync(string data);
    Task<string> ReadAsync();
    Task FlushAsync();
    Task CloseAsync();
    long GetSize();
    string GetStreamInfo();
}
