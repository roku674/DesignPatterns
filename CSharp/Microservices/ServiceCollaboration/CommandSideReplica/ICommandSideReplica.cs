namespace Microservices.ServiceCollaboration.CommandSideReplica;

/// <summary>
/// Maintains replica on command side to improve queries
/// </summary>
public interface ICommandSideReplica
{
    void Execute();
}
