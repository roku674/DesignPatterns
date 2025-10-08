using System;

namespace Integration.Endpoints.MessageDispatcher;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageDispatcher Pattern Demo ===\n");
        IMessageDispatcher pattern = new MessageDispatcherImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
