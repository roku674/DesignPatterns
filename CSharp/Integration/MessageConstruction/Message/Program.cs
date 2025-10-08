using System;

namespace Integration.MessageConstruction.Message;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== Message Pattern Demo ===\n");
        IMessage pattern = new MessageImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
