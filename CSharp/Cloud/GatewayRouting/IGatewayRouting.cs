namespace Cloud.GatewayRouting;

/// <summary>
/// Routes requests to multiple services using single endpoint
/// </summary>
public interface IGatewayRouting
{
    void Execute();
}
