using System;

namespace Integration.Endpoints.TransactionalClient;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TransactionalClient Pattern Demo ===\n");
        ITransactionalClient pattern = new TransactionalClientImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
