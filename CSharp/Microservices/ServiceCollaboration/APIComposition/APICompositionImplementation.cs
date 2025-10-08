using System;

namespace Microservices.ServiceCollaboration.APIComposition;

/// <summary>
/// Implementation of APIComposition pattern.
/// Implements query by invoking services and combining results
/// </summary>
public class APICompositionImplementation : IAPIComposition
{
    public void Execute()
    {
        Console.WriteLine("APIComposition pattern executing...");
    }
}
