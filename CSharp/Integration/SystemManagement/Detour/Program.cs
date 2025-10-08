using System;

namespace Integration.SystemManagement.Detour;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Detour Pattern Demo ===\n");
        IDetour pattern = new DetourImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
