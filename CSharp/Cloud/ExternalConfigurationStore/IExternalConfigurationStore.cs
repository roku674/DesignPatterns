namespace Cloud.ExternalConfigurationStore;

/// <summary>
/// Moves configuration from application deployment package
/// </summary>
public interface IExternalConfigurationStore
{
    void Execute();
}
