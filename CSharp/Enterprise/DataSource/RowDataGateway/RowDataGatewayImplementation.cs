using System;

namespace Enterprise.DataSource.RowDataGateway;

/// <summary>
/// Concrete implementation of RowDataGateway pattern.
/// Gateway object with one instance per database row
/// </summary>
public class RowDataGatewayImplementation : IRowDataGateway
{
    public void Execute()
    {
        Console.WriteLine("RowDataGateway pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
