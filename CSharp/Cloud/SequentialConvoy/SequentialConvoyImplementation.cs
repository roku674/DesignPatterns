using System;

namespace Cloud.SequentialConvoy;

/// <summary>
/// Implementation of SequentialConvoy pattern.
/// Processes set of related messages in defined order
/// </summary>
public class SequentialConvoyImplementation : ISequentialConvoy
{
    public void Execute()
    {
        Console.WriteLine("SequentialConvoy pattern executing...");
    }
}
