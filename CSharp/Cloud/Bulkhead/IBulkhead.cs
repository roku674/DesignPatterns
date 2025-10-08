namespace Cloud.Bulkhead;

/// <summary>
/// Isolates elements into pools to prevent cascade failures
/// </summary>
public interface IBulkhead
{
    void Execute();
}
