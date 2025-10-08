namespace Cloud.Sharding;

/// <summary>
/// Divides data store into horizontal partitions
/// </summary>
public interface ISharding
{
    void Execute();
}
