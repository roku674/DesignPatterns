using System;

namespace Cloud.StranglerFig;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== StranglerFig Pattern Demo ===\n");
        IStranglerFig pattern = new StranglerFigImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
