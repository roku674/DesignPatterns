using System;

namespace Cloud.MessagingBridge;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessagingBridge Pattern Demo ===\n");
        IMessagingBridge pattern = new MessagingBridgeImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
