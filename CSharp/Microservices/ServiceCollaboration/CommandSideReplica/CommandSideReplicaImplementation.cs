using System;

namespace Microservices.ServiceCollaboration.CommandSideReplica;

/// <summary>
/// Implementation of CommandSideReplica pattern.
/// Maintains replica on command side to improve queries
/// </summary>
public class CommandSideReplicaImplementation : ICommandSideReplica
{
    public void Execute()
    {
        Console.WriteLine("CommandSideReplica pattern executing...");
    }
}
