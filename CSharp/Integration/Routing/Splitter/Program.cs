using System;

namespace Integration.Routing.Splitter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Splitter Pattern Demo ===\n");
        ISplitter pattern = new SplitterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
