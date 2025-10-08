namespace Cloud.Throttling;

/// <summary>
/// Controls consumption of resources by application instance
/// </summary>
public interface IThrottling
{
    void Execute();
}
