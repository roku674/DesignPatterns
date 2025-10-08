using System;

namespace Integration.Transformation.ContentFilter;

/// <summary>
/// Implementation of ContentFilter pattern.
/// Removes unwanted data
/// </summary>
public class ContentFilterImplementation : IContentFilter
{
    public void Execute()
    {
        Console.WriteLine("ContentFilter pattern executing...");
    }
}
