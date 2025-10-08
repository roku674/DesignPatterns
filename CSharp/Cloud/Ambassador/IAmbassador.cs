namespace Cloud.Ambassador;

/// <summary>
/// Creates helper services that send network requests on behalf of consumer
/// </summary>
public interface IAmbassador
{
    void Execute();
}
