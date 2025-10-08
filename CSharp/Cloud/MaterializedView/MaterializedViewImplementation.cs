using System;

namespace Cloud.MaterializedView;

/// <summary>
/// Implementation of MaterializedView pattern.
/// Generates prepopulated views over data
/// </summary>
public class MaterializedViewImplementation : IMaterializedView
{
    public void Execute()
    {
        Console.WriteLine("MaterializedView pattern executing...");
    }
}
