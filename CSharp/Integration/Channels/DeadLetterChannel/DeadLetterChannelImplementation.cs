using System;

namespace Integration.Channels.DeadLetterChannel;

/// <summary>
/// Implementation of DeadLetterChannel pattern.
/// Handles undeliverable messages
/// </summary>
public class DeadLetterChannelImplementation : IDeadLetterChannel
{
    public void Execute()
    {
        Console.WriteLine("DeadLetterChannel pattern executing...");
    }
}
