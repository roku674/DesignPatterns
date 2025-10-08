using System;

namespace Integration.Channels.GuaranteedDelivery;

/// <summary>
/// Implementation of GuaranteedDelivery pattern.
/// Ensures message delivery
/// </summary>
public class GuaranteedDeliveryImplementation : IGuaranteedDelivery
{
    public void Execute()
    {
        Console.WriteLine("GuaranteedDelivery pattern executing...");
    }
}
