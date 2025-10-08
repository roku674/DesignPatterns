using System;

namespace Integration.Routing.RecipientList;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RecipientList Pattern Demo ===\n");
        IRecipientList pattern = new RecipientListImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
