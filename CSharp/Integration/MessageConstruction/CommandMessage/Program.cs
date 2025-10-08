using System;

namespace Integration.MessageConstruction.CommandMessage;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CommandMessage Pattern Demo ===\n");
        ICommandMessage pattern = new CommandMessageImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
