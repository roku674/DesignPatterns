using System;

namespace Concurrency.LeaderFollowers;

/// <summary>
/// Demonstrates the LeaderFollowers pattern.
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LeaderFollowers Pattern Demo ===\n");

        ILeaderFollowers pattern = new LeaderFollowersImplementation();
        pattern.Execute();

        Console.WriteLine("\n=== Demo Complete ===");
    }
}
