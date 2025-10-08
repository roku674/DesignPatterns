using System;

namespace Enterprise.Distribution.DataTransferObject;

/// <summary>
/// Concrete implementation of DataTransferObject pattern.
/// Object carrying data between processes
/// </summary>
public class DataTransferObjectImplementation : IDataTransferObject
{
    public void Execute()
    {
        Console.WriteLine("DataTransferObject pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
