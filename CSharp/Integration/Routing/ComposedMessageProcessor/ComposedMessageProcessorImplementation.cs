using System;

namespace Integration.Routing.ComposedMessageProcessor;

/// <summary>
/// Implementation of ComposedMessageProcessor pattern.
/// Maintains overall flow
/// </summary>
public class ComposedMessageProcessorImplementation : IComposedMessageProcessor
{
    public void Execute()
    {
        Console.WriteLine("ComposedMessageProcessor pattern executing...");
    }
}
