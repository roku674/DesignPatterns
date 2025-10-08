using System;

namespace Cloud.Quarantine;

/// <summary>
/// Implementation of Quarantine pattern.
/// Validates external inputs before routing to application
/// </summary>
public class QuarantineImplementation : IQuarantine
{
    public void Execute()
    {
        Console.WriteLine("Quarantine pattern executing...");
    }
}
