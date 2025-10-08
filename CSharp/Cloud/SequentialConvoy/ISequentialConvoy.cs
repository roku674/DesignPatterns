namespace Cloud.SequentialConvoy;

/// <summary>
/// Processes set of related messages in defined order
/// </summary>
public interface ISequentialConvoy
{
    void Execute();
}
