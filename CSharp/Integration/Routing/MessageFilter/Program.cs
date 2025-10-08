using System;

namespace Integration.Routing.MessageFilter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageFilter Pattern Demo ===\n");
        IMessageFilter pattern = new MessageFilterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
