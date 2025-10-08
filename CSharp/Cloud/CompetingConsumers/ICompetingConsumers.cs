namespace Cloud.CompetingConsumers;

/// <summary>
/// Enables multiple consumers to process messages concurrently
/// </summary>
public interface ICompetingConsumers
{
    void Execute();
}
