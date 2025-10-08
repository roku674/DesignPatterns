using System;

namespace Integration.SystemManagement.SmartProxy;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SmartProxy Pattern Demo ===\n");
        ISmartProxy pattern = new SmartProxyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
