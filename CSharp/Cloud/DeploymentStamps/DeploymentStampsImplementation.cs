using System;

namespace Cloud.DeploymentStamps;

/// <summary>
/// Implementation of DeploymentStamps pattern.
/// Deploys multiple independent copies of application components
/// </summary>
public class DeploymentStampsImplementation : IDeploymentStamps
{
    public void Execute()
    {
        Console.WriteLine("DeploymentStamps pattern executing...");
    }
}
