using System;

namespace Cloud.IndexTable;

/// <summary>
/// Implementation of IndexTable pattern.
/// Creates indexes over fields frequently referenced by queries
/// </summary>
public class IndexTableImplementation : IIndexTable
{
    public void Execute()
    {
        Console.WriteLine("IndexTable pattern executing...");
    }
}
