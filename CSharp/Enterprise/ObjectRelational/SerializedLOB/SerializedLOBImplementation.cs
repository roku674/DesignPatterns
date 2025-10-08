using System;

namespace Enterprise.ObjectRelational.SerializedLOB;

/// <summary>
/// Concrete implementation of SerializedLOB pattern.
/// Saves graph of objects by serializing into single field
/// </summary>
public class SerializedLOBImplementation : ISerializedLOB
{
    public void Execute()
    {
        Console.WriteLine("SerializedLOB pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
