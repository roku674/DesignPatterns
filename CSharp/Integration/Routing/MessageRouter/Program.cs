using System;

namespace Integration.Routing.MessageRouter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageRouter Pattern Demo ===\n");
        IMessageRouter pattern = new MessageRouterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
