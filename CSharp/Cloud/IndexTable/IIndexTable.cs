namespace Cloud.IndexTable;

/// <summary>
/// Creates indexes over fields frequently referenced by queries
/// </summary>
public interface IIndexTable
{
    void Execute();
}
