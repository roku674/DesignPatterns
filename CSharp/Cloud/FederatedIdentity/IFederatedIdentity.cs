namespace Cloud.FederatedIdentity;

/// <summary>
/// Delegates authentication to external identity provider
/// </summary>
public interface IFederatedIdentity
{
    void Execute();
}
