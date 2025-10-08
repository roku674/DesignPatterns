using System;

namespace Integration.Endpoints.MessagingMapper;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessagingMapper Pattern Demo ===\n");
        IMessagingMapper pattern = new MessagingMapperImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
