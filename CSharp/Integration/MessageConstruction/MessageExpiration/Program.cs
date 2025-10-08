using System;

namespace Integration.MessageConstruction.MessageExpiration;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageExpiration Pattern Demo ===\n");
        IMessageExpiration pattern = new MessageExpirationImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
