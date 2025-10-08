using System;

namespace Enterprise.ObjectRelational.ConcreteTableInheritance;

/// <summary>
/// Concrete implementation of ConcreteTableInheritance pattern.
/// One table per concrete class
/// </summary>
public class ConcreteTableInheritanceImplementation : IConcreteTableInheritance
{
    public void Execute()
    {
        Console.WriteLine("ConcreteTableInheritance pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
