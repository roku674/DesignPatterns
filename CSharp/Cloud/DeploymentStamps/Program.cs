using System;

namespace Cloud.DeploymentStamps;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DeploymentStamps Pattern Demo ===\n");
        IDeploymentStamps pattern = new DeploymentStampsImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
