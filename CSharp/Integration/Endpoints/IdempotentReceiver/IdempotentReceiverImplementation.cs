using System;

namespace Integration.Endpoints.IdempotentReceiver;

/// <summary>
/// Implementation of IdempotentReceiver pattern.
/// Handles duplicate messages
/// </summary>
public class IdempotentReceiverImplementation : IIdempotentReceiver
{
    public void Execute()
    {
        Console.WriteLine("IdempotentReceiver pattern executing...");
    }
}
