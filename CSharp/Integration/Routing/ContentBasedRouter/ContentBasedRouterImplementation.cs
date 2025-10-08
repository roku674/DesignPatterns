using System;

namespace Integration.Routing.ContentBasedRouter;

/// <summary>
/// Implementation of ContentBasedRouter pattern.
/// Routes based on message content
/// </summary>
public class ContentBasedRouterImplementation : IContentBasedRouter
{
    public void Execute()
    {
        Console.WriteLine("ContentBasedRouter pattern executing...");
    }
}
