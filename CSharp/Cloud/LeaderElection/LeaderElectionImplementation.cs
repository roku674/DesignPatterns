using System;

namespace Cloud.LeaderElection;

/// <summary>
/// Implementation of LeaderElection pattern.
/// Coordinates actions by electing one instance as leader
/// </summary>
public class LeaderElectionImplementation : ILeaderElection
{
    public void Execute()
    {
        Console.WriteLine("LeaderElection pattern executing...");
    }
}
