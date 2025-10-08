using System;

namespace Integration.Transformation.MessageTranslator;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== MessageTranslator Pattern Demo ===\n");
        IMessageTranslator pattern = new MessageTranslatorImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
