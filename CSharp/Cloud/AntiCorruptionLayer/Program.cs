using System;

namespace Cloud.AntiCorruptionLayer;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== AntiCorruptionLayer Pattern Demo ===\n");
        IAntiCorruptionLayer pattern = new AntiCorruptionLayerImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
