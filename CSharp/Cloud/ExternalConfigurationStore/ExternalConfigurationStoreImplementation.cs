using System;

namespace Cloud.ExternalConfigurationStore;

/// <summary>
/// Implementation of ExternalConfigurationStore pattern.
/// Moves configuration from application deployment package
/// </summary>
public class ExternalConfigurationStoreImplementation : IExternalConfigurationStore
{
    public void Execute()
    {
        Console.WriteLine("ExternalConfigurationStore pattern executing...");
    }
}
