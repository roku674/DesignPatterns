namespace Integration.Channels.GuaranteedDelivery;

/// <summary>
/// Ensures message delivery
/// </summary>
public interface IGuaranteedDelivery
{
    void Execute();
}
