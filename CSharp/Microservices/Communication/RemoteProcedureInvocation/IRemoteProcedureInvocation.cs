namespace Microservices.Communication.RemoteProcedureInvocation;

/// <summary>
/// Uses RPC for inter-service communication
/// </summary>
public interface IRemoteProcedureInvocation
{
    void Execute();
}
