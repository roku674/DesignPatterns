using System;

namespace Integration.Transformation.EnvelopeWrapper;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== EnvelopeWrapper Pattern Demo ===\n");
        IEnvelopeWrapper pattern = new EnvelopeWrapperImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
