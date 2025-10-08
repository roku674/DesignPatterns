using System;

namespace Enterprise.ObjectRelational.SerializedLOB;

/// <summary>
/// Demonstrates the SerializedLOB pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== SerializedLOB Pattern Demo ===\n");

        ISerializedLOB pattern = new SerializedLOBImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
