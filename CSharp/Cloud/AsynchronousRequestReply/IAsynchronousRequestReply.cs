namespace Cloud.AsynchronousRequestReply;

/// <summary>
/// Decouples backend processing from frontend
/// </summary>
public interface IAsynchronousRequestReply
{
    void Execute();
}
