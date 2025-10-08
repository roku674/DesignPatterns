using System;

namespace Cloud.Bulkhead;

/// <summary>
/// Implementation of Bulkhead pattern.
/// Isolates elements into pools to prevent cascade failures
/// </summary>
public class BulkheadImplementation : IBulkhead
{
    public void Execute()
    {
        Console.WriteLine("Bulkhead pattern executing...");
    }
}
