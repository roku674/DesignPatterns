namespace Concurrency.ActiveObject;

/// <summary>
/// Decouples method execution from invocation
/// </summary>
public interface IActiveObject
{
    void Execute();
}
