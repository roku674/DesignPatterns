using System;

namespace Integration.Transformation.ContentFilter;

public class Program
{
    public static void Main(string[] args)
    {
        Console.WriteLine("=== ContentFilter Pattern Demo ===\n");
        IContentFilter pattern = new ContentFilterImplementation();
        pattern.Execute();
        Console.WriteLine("\n=== Demo Complete ===");
    }
}
