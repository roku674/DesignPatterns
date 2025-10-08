using System;

namespace Integration.SystemManagement.WireTap;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== WireTap Pattern Demo ===\n");
        IWireTap pattern = new WireTapImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
