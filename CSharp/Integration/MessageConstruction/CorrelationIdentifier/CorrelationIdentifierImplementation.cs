using System;

namespace Integration.MessageConstruction.CorrelationIdentifier;

/// <summary>
/// Implementation of CorrelationIdentifier pattern.
/// Matches request with reply
/// </summary>
public class CorrelationIdentifierImplementation : ICorrelationIdentifier
{
    public void Execute()
    {
        Console.WriteLine("CorrelationIdentifier pattern executing...");
    }
}
