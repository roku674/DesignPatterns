using System;

namespace Integration.MessageConstruction.MessageSequence;

/// <summary>
/// Implementation of MessageSequence pattern.
/// Transmits large data as sequence
/// </summary>
public class MessageSequenceImplementation : IMessageSequence
{
    public void Execute()
    {
        Console.WriteLine("MessageSequence pattern executing...");
    }
}
