namespace Microservices.Communication.Messaging;

/// <summary>
/// Uses asynchronous messaging for inter-service communication
/// </summary>
public interface IMessaging
{
    void Execute();
}
