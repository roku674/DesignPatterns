using System;

namespace Enterprise.ObjectRelational.UnitOfWork;

/// <summary>
/// Concrete implementation of UnitOfWork pattern.
/// Maintains list of objects affected by business transaction
/// </summary>
public class UnitOfWorkImplementation : IUnitOfWork
{
    public void Execute()
    {
        Console.WriteLine("UnitOfWork pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
