namespace Enterprise.BasePatterns.ServiceStub;

/// <summary>
/// Removes dependence on services during testing
/// </summary>
public interface IServiceStub
{
    void Execute();
}
