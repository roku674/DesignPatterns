namespace Concurrency.AcceptorConnector;

/// <summary>
/// Decouples connection establishment from service
/// </summary>
public interface IAcceptorConnector
{
    void Execute();
}
