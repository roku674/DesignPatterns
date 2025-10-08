using System;

namespace Integration.Channels.DatatypeChannel;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DatatypeChannel Pattern Demo ===\n");
        IDatatypeChannel pattern = new DatatypeChannelImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
