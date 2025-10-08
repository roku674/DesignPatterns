namespace Microservices.CrossCutting.ExternalizedConfiguration;

/// <summary>
/// Externalizes configuration from service
/// </summary>
public interface IExternalizedConfiguration
{
    void Execute();
}
