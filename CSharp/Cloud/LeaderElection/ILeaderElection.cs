namespace Cloud.LeaderElection;

/// <summary>
/// Coordinates actions by electing one instance as leader
/// </summary>
public interface ILeaderElection
{
    void Execute();
}
