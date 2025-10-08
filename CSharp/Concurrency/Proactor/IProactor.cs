namespace Concurrency.Proactor;

/// <summary>
/// Demultiplexes and dispatches event handlers asynchronously
/// </summary>
public interface IProactor
{
    void Execute();
}
