namespace Enterprise.DataSource.TableDataGateway;

/// <summary>
/// Gateway to a database table with one instance per table
/// </summary>
public interface ITableDataGateway
{
    void Execute();
}
