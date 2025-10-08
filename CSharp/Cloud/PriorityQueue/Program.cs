using System;

namespace Cloud.PriorityQueue;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== PriorityQueue Pattern Demo ===\n");
        IPriorityQueue pattern = new PriorityQueueImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
