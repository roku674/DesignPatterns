namespace Concurrency.Interceptor;

/// <summary>
/// Allows transparently adding services to framework
/// </summary>
public interface IInterceptor
{
    void Execute();
}
