using System;

namespace Microservices.UI.ClientSideUIComposition;

/// <summary>
/// Implementation of ClientSideUIComposition pattern.
/// Composes UI on client side
/// </summary>
public class ClientSideUICompositionImplementation : IClientSideUIComposition
{
    public void Execute()
    {
        Console.WriteLine("ClientSideUIComposition pattern executing...");
    }
}
