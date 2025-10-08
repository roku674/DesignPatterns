using System;

namespace Integration.Transformation.CanonicalDataModel;

/// <summary>
/// Implementation of CanonicalDataModel pattern.
/// Minimizes dependencies using common format
/// </summary>
public class CanonicalDataModelImplementation : ICanonicalDataModel
{
    public void Execute()
    {
        Console.WriteLine("CanonicalDataModel pattern executing...");
    }
}
