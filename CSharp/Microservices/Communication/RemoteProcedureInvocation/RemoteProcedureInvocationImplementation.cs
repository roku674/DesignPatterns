using System;

namespace Microservices.Communication.RemoteProcedureInvocation;

/// <summary>
/// Implementation of RemoteProcedureInvocation pattern.
/// Uses RPC for inter-service communication
/// </summary>
public class RemoteProcedureInvocationImplementation : IRemoteProcedureInvocation
{
    public void Execute()
    {
        Console.WriteLine("RemoteProcedureInvocation pattern executing...");
    }
}
