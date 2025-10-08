using System;

namespace Cloud.PublisherSubscriber;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PublisherSubscriber Pattern Demo ===\n");
        IPublisherSubscriber pattern = new PublisherSubscriberImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
