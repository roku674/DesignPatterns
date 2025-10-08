using System;

namespace Integration.SystemManagement.ControlBus;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ControlBus Pattern Demo ===\n");
        IControlBus pattern = new ControlBusImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
