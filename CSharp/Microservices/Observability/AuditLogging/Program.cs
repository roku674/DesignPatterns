using System;

namespace Microservices.Observability.AuditLogging;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AuditLogging Pattern Demo ===\n");
        IAuditLogging pattern = new AuditLoggingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
