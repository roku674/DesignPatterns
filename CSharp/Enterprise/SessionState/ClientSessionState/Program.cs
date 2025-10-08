using System;

namespace Enterprise.SessionState.ClientSessionState;

/// <summary>
/// Demonstrates the ClientSessionState pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ClientSessionState Pattern Demo ===\n");

        IClientSessionState pattern = new ClientSessionStateImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
