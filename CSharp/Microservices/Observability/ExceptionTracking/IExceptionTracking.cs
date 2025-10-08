namespace Microservices.Observability.ExceptionTracking;

/// <summary>
/// Reports exceptions to centralized service
/// </summary>
public interface IExceptionTracking
{
    void Execute();
}
