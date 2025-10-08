using System;

namespace Integration.SystemManagement.TestMessage;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== TestMessage Pattern Demo ===\n");
        ITestMessage pattern = new TestMessageImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
