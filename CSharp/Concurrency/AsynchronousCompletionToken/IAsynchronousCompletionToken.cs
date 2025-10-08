namespace Concurrency.AsynchronousCompletionToken;

/// <summary>
/// Allows efficient demultiplexing of responses
/// </summary>
public interface IAsynchronousCompletionToken
{
    void Execute();
}
