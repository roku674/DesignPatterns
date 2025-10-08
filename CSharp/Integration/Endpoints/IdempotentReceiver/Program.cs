using System;

namespace Integration.Endpoints.IdempotentReceiver;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== IdempotentReceiver Pattern Demo ===\n");
        IIdempotentReceiver pattern = new IdempotentReceiverImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
