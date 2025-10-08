namespace Integration.Routing.Resequencer;

/// <summary>
/// Restores correct message order
/// </summary>
public interface IResequencer
{
    void Execute();
}
