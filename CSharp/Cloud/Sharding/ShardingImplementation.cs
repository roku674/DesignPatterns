using System;

namespace Cloud.Sharding;

/// <summary>
/// Implementation of Sharding pattern.
/// Divides data store into horizontal partitions
/// </summary>
public class ShardingImplementation : ISharding
{
    public void Execute()
    {
        Console.WriteLine("Sharding pattern executing...");
    }
}
