using System;

namespace Integration.Transformation.ContentEnricher;

/// <summary>
/// Implementation of ContentEnricher pattern.
/// Adds necessary data to message
/// </summary>
public class ContentEnricherImplementation : IContentEnricher
{
    public void Execute()
    {
        Console.WriteLine("ContentEnricher pattern executing...");
    }
}
