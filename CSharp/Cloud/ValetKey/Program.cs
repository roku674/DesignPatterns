using System;

namespace Cloud.ValetKey;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ValetKey Pattern Demo ===\n");
        IValetKey pattern = new ValetKeyImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
