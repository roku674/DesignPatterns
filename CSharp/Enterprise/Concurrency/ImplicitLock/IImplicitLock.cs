namespace Enterprise.Concurrency.ImplicitLock;

/// <summary>
/// Framework manages locks automatically
/// </summary>
public interface IImplicitLock
{
    void Execute();
}
