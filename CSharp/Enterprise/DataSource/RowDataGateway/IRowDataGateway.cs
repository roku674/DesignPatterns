namespace Enterprise.DataSource.RowDataGateway;

/// <summary>
/// Gateway object with one instance per database row
/// </summary>
public interface IRowDataGateway
{
    void Execute();
}
