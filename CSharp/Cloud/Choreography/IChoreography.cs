namespace Cloud.Choreography;

/// <summary>
/// Lets each service decide when and how to react to events
/// </summary>
public interface IChoreography
{
    void Execute();
}
