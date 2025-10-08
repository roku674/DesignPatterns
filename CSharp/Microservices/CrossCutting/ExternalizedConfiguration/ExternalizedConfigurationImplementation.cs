using System;

namespace Microservices.CrossCutting.ExternalizedConfiguration;

/// <summary>
/// Implementation of ExternalizedConfiguration pattern.
/// Externalizes configuration from service
/// </summary>
public class ExternalizedConfigurationImplementation : IExternalizedConfiguration
{
    public void Execute()
    {
        Console.WriteLine("ExternalizedConfiguration pattern executing...");
    }
}
