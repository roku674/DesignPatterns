using System;

namespace Integration.MessageConstruction.FormatIndicator;

/// <summary>
/// Implementation of FormatIndicator pattern.
/// Indicates message format
/// </summary>
public class FormatIndicatorImplementation : IFormatIndicator
{
    public void Execute()
    {
        Console.WriteLine("FormatIndicator pattern executing...");
    }
}
