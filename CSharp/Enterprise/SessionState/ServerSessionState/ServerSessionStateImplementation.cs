using System;

namespace Enterprise.SessionState.ServerSessionState;

/// <summary>
/// Concrete implementation of ServerSessionState pattern.
/// Stores session state on the server
/// </summary>
public class ServerSessionStateImplementation : IServerSessionState
{
    public void Execute()
    {
        Console.WriteLine("ServerSessionState pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
