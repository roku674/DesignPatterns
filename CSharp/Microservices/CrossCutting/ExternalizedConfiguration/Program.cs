using System;

namespace Microservices.CrossCutting.ExternalizedConfiguration;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ExternalizedConfiguration Pattern Demo ===\n");
        IExternalizedConfiguration pattern = new ExternalizedConfigurationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
