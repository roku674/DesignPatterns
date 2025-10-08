namespace Integration.Endpoints.CompetingConsumers;

/// <summary>
/// Multiple consumers compete for messages
/// </summary>
public interface ICompetingConsumers
{
    void Execute();
}
