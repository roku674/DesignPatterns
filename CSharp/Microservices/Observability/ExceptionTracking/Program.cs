using System;

namespace Microservices.Observability.ExceptionTracking;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ExceptionTracking Pattern Demo ===\n");
        IExceptionTracking pattern = new ExceptionTrackingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
