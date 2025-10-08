using System;

namespace Enterprise.SessionState.ServerSessionState;

/// <summary>
/// Demonstrates the ServerSessionState pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ServerSessionState Pattern Demo ===\n");

        IServerSessionState pattern = new ServerSessionStateImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
