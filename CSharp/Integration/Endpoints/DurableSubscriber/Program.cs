using System;

namespace Integration.Endpoints.DurableSubscriber;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DurableSubscriber Pattern Demo ===\n");
        IDurableSubscriber pattern = new DurableSubscriberImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
