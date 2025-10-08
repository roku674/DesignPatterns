using System;

namespace Enterprise.DataSource.DataMapper;

/// <summary>
/// Concrete implementation of DataMapper pattern.
/// Layer that moves data between objects and database
/// </summary>
public class DataMapperImplementation : IDataMapper
{
    public void Execute()
    {
        Console.WriteLine("DataMapper pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
