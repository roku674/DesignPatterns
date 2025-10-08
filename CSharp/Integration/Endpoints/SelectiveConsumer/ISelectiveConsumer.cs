namespace Integration.Endpoints.SelectiveConsumer;

/// <summary>
/// Filters messages it receives
/// </summary>
public interface ISelectiveConsumer
{
    void Execute();
}
