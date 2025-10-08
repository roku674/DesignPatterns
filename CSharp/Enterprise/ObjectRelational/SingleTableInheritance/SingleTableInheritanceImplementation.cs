using System;

namespace Enterprise.ObjectRelational.SingleTableInheritance;

/// <summary>
/// Concrete implementation of SingleTableInheritance pattern.
/// All hierarchy in one table with type discriminator
/// </summary>
public class SingleTableInheritanceImplementation : ISingleTableInheritance
{
    public void Execute()
    {
        Console.WriteLine("SingleTableInheritance pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
