using System;

namespace Cloud.Choreography;

/// <summary>
/// Implementation of Choreography pattern.
/// Lets each service decide when and how to react to events
/// </summary>
public class ChoreographyImplementation : IChoreography
{
    public void Execute()
    {
        Console.WriteLine("Choreography pattern executing...");
    }
}
