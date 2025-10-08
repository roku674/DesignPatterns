using System;

namespace Integration.MessageConstruction.ReturnAddress;

/// <summary>
/// Implementation of ReturnAddress pattern.
/// Indicates where reply should be sent
/// </summary>
public class ReturnAddressImplementation : IReturnAddress
{
    public void Execute()
    {
        Console.WriteLine("ReturnAddress pattern executing...");
    }
}
