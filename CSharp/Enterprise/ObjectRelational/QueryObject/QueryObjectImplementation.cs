using System;

namespace Enterprise.ObjectRelational.QueryObject;

/// <summary>
/// Concrete implementation of QueryObject pattern.
/// Object representing database query
/// </summary>
public class QueryObjectImplementation : IQueryObject
{
    public void Execute()
    {
        Console.WriteLine("QueryObject pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
