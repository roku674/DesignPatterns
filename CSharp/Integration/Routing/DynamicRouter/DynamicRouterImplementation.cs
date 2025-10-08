using System;

namespace Integration.Routing.DynamicRouter;

/// <summary>
/// Implementation of DynamicRouter pattern.
/// Routes with dynamic rules
/// </summary>
public class DynamicRouterImplementation : IDynamicRouter
{
    public void Execute()
    {
        Console.WriteLine("DynamicRouter pattern executing...");
    }
}
