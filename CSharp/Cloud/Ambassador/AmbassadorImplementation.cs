using System;

namespace Cloud.Ambassador;

/// <summary>
/// Implementation of Ambassador pattern.
/// Creates helper services that send network requests on behalf of consumer
/// </summary>
public class AmbassadorImplementation : IAmbassador
{
    public void Execute()
    {
        Console.WriteLine("Ambassador pattern executing...");
    }
}
