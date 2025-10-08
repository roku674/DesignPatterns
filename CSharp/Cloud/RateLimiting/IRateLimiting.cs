namespace Cloud.RateLimiting;

/// <summary>
/// Controls resource consumption by limiting rate of requests
/// </summary>
public interface IRateLimiting
{
    void Execute();
}
