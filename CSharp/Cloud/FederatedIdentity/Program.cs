using System;

namespace Cloud.FederatedIdentity;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== FederatedIdentity Pattern Demo ===\n");
        IFederatedIdentity pattern = new FederatedIdentityImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
