namespace Cloud.CacheAside;

/// <summary>
/// Loads data on demand into cache from data store
/// </summary>
public interface ICacheAside
{
    void Execute();
}
