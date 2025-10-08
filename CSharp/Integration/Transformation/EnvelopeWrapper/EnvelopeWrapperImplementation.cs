using System;

namespace Integration.Transformation.EnvelopeWrapper;

/// <summary>
/// Implementation of EnvelopeWrapper pattern.
/// Wraps message with routing information
/// </summary>
public class EnvelopeWrapperImplementation : IEnvelopeWrapper
{
    public void Execute()
    {
        Console.WriteLine("EnvelopeWrapper pattern executing...");
    }
}
