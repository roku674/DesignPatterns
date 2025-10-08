using System;

namespace Cloud.CompensatingTransaction;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== CompensatingTransaction Pattern Demo ===\n");
        ICompensatingTransaction pattern = new CompensatingTransactionImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
