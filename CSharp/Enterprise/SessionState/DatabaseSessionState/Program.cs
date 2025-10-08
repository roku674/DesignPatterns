using System;

namespace Enterprise.SessionState.DatabaseSessionState;

/// <summary>
/// Demonstrates the DatabaseSessionState pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== DatabaseSessionState Pattern Demo ===\n");

        IDatabaseSessionState pattern = new DatabaseSessionStateImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
