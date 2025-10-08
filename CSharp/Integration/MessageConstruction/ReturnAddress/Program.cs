using System;

namespace Integration.MessageConstruction.ReturnAddress;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ReturnAddress Pattern Demo ===\n");
        IReturnAddress pattern = new ReturnAddressImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
