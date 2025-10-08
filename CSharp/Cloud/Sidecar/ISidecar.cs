namespace Cloud.Sidecar;

/// <summary>
/// Deploys components into separate process for isolation
/// </summary>
public interface ISidecar
{
    void Execute();
}
