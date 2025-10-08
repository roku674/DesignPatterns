using System;

namespace Enterprise.Distribution.RemoteFacade;

/// <summary>
/// Demonstrates the RemoteFacade pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== RemoteFacade Pattern Demo ===\n");

        IRemoteFacade pattern = new RemoteFacadeImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
