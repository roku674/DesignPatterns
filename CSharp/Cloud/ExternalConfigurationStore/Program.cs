using System;

namespace Cloud.ExternalConfigurationStore;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ExternalConfigurationStore Pattern Demo ===\n");
        IExternalConfigurationStore pattern = new ExternalConfigurationStoreImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
