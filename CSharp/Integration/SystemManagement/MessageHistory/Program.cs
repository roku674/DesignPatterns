using System;

namespace Integration.SystemManagement.MessageHistory;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageHistory Pattern Demo ===\n");
        IMessageHistory pattern = new MessageHistoryImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
