namespace Integration.Routing.MessageRouter;

/// <summary>
/// Routes message to different consumers
/// </summary>
public interface IMessageRouter
{
    void Execute();
}
