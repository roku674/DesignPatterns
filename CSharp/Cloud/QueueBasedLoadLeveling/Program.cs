using System;

namespace Cloud.QueueBasedLoadLeveling;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== QueueBasedLoadLeveling Pattern Demo ===\n");
        IQueueBasedLoadLeveling pattern = new QueueBasedLoadLevelingImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
