using System;

namespace Microservices.DataManagement.TransactionOutbox;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TransactionOutbox Pattern Demo ===\n");
        ITransactionOutbox pattern = new TransactionOutboxImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
