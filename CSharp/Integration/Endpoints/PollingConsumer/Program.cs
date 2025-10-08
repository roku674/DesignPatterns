using System;

namespace Integration.Endpoints.PollingConsumer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PollingConsumer Pattern Demo ===\n");
        IPollingConsumer pattern = new PollingConsumerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
