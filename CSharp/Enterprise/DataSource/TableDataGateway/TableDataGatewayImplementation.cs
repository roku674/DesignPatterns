using System;

namespace Enterprise.DataSource.TableDataGateway;

/// <summary>
/// Concrete implementation of TableDataGateway pattern.
/// Gateway to a database table with one instance per table
/// </summary>
public class TableDataGatewayImplementation : ITableDataGateway
{
    public void Execute()
    {
        Console.WriteLine("TableDataGateway pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
