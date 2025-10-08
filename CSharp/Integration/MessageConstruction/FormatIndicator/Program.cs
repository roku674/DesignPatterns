using System;

namespace Integration.MessageConstruction.FormatIndicator;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== FormatIndicator Pattern Demo ===\n");
        IFormatIndicator pattern = new FormatIndicatorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
