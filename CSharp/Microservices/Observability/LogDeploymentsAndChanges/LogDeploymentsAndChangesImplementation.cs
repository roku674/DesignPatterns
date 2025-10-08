using System;

namespace Microservices.Observability.LogDeploymentsAndChanges;

/// <summary>
/// Implementation of LogDeploymentsAndChanges pattern.
/// Logs deployments and changes for correlation
/// </summary>
public class LogDeploymentsAndChangesImplementation : ILogDeploymentsAndChanges
{
    public void Execute()
    {
        Console.WriteLine("LogDeploymentsAndChanges pattern executing...");
    }
}
