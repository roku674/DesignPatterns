using System;

namespace Integration.Routing.Splitter;

/// <summary>
/// Implementation of Splitter pattern.
/// Breaks message into parts
/// </summary>
public class SplitterImplementation : ISplitter
{
    public void Execute()
    {
        Console.WriteLine("Splitter pattern executing...");
    }
}
