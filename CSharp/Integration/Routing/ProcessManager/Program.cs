using System;

namespace Integration.Routing.ProcessManager;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ProcessManager Pattern Demo ===\n");
        IProcessManager pattern = new ProcessManagerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
