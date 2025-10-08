using System;

namespace Cloud.CompensatingTransaction;

/// <summary>
/// Implementation of CompensatingTransaction pattern.
/// Undoes work performed by series of steps
/// </summary>
public class CompensatingTransactionImplementation : ICompensatingTransaction
{
    public void Execute()
    {
        Console.WriteLine("CompensatingTransaction pattern executing...");
    }
}
