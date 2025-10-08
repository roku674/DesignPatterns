using System;

namespace Cloud.StranglerFig;

/// <summary>
/// Implementation of StranglerFig pattern.
/// Incrementally migrates legacy system by replacing functionality
/// </summary>
public class StranglerFigImplementation : IStranglerFig
{
    public void Execute()
    {
        Console.WriteLine("StranglerFig pattern executing...");
    }
}
