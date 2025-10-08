using System;

namespace Cloud.CQRS;

/// <summary>
/// Implementation of CQRS pattern.
/// Segregates operations that read data from operations that update data
/// </summary>
public class CQRSImplementation : ICQRS
{
    public void Execute()
    {
        Console.WriteLine("CQRS pattern executing...");
    }
}
