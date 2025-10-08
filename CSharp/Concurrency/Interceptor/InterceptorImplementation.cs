using System;

namespace Concurrency.Interceptor;

/// <summary>
/// Concrete implementation of Interceptor pattern.
/// Allows transparently adding services to framework
/// </summary>
public class InterceptorImplementation : IInterceptor
{
    public void Execute()
    {
        Console.WriteLine("Interceptor pattern executing...");
        // TODO: Implement pattern-specific logic
    }
}
