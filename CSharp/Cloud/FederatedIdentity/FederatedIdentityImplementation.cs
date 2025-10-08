using System;

namespace Cloud.FederatedIdentity;

/// <summary>
/// Implementation of FederatedIdentity pattern.
/// Delegates authentication to external identity provider
/// </summary>
public class FederatedIdentityImplementation : IFederatedIdentity
{
    public void Execute()
    {
        Console.WriteLine("FederatedIdentity pattern executing...");
    }
}
