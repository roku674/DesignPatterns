using System;

namespace Enterprise.ObjectRelational.ClassTableInheritance;

/// <summary>
/// Concrete implementation of ClassTableInheritance pattern.
/// One table per class in hierarchy
/// </summary>
public class ClassTableInheritanceImplementation : IClassTableInheritance
{
    public void Execute()
    {
        Console.WriteLine("ClassTableInheritance pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
