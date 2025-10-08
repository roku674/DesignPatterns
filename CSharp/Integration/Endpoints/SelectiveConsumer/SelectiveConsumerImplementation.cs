using System;

namespace Integration.Endpoints.SelectiveConsumer;

/// <summary>
/// Implementation of SelectiveConsumer pattern.
/// Filters messages it receives
/// </summary>
public class SelectiveConsumerImplementation : ISelectiveConsumer
{
    public void Execute()
    {
        Console.WriteLine("SelectiveConsumer pattern executing...");
    }
}
