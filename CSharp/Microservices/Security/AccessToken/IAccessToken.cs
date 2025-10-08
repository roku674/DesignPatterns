namespace Microservices.Security.AccessToken;

/// <summary>
/// Uses tokens for inter-service authentication
/// </summary>
public interface IAccessToken
{
    void Execute();
}
