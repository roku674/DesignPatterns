using System;

namespace Cloud.LeaderElection;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== LeaderElection Pattern Demo ===\n");
        ILeaderElection pattern = new LeaderElectionImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
