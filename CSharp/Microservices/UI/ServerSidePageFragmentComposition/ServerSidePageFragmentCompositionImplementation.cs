using System;

namespace Microservices.UI.ServerSidePageFragmentComposition;

/// <summary>
/// Implementation of ServerSidePageFragmentComposition pattern.
/// Composes pages on server from fragments
/// </summary>
public class ServerSidePageFragmentCompositionImplementation : IServerSidePageFragmentComposition
{
    public void Execute()
    {
        Console.WriteLine("ServerSidePageFragmentComposition pattern executing...");
    }
}
