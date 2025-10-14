using System;
using System.Threading.Tasks;

namespace Cloud.Retry;

/// <summary>
/// Handles transient failures by transparently retrying
/// </summary>
public interface IRetry
{
    void Execute();
}

/// <summary>
/// Retry policy for operations
/// </summary>
public interface IRetryPolicy<T>
{
    Task<T> ExecuteAsync(Func<Task<T>> operation);
    int MaxRetries { get; }
    int RetryCount { get; }
}

/// <summary>
/// Retry strategy that determines wait time between retries
/// </summary>
public interface IRetryStrategy
{
    TimeSpan GetWaitTime(int retryAttempt);
}

/// <summary>
/// Exception thrown when all retry attempts are exhausted
/// </summary>
public class RetryExhaustedException : Exception
{
    public int Attempts { get; }

    public RetryExhaustedException(int attempts)
        : base($"All {attempts} retry attempts exhausted")
    {
        Attempts = attempts;
    }

    public RetryExhaustedException(int attempts, Exception innerException)
        : base($"All {attempts} retry attempts exhausted", innerException)
    {
        Attempts = attempts;
    }
}
