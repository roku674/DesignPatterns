namespace Concurrency.Reactor;

/// <summary>
/// Demultiplexes and dispatches event handlers synchronously
/// </summary>
public interface IReactor
{
    void Execute();
}
