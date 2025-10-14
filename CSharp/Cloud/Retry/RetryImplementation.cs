using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Cloud.Retry;

/// <summary>
/// Implementation of Retry pattern.
/// Handles transient failures by transparently retrying
/// </summary>
public class RetryImplementation : IRetry
{
    public void Execute()
    {
        Console.WriteLine("Retry pattern executing...");
    }
}

/// <summary>
/// Fixed interval retry strategy
/// </summary>
public class FixedIntervalRetryStrategy : IRetryStrategy
{
    private readonly TimeSpan _interval;

    public FixedIntervalRetryStrategy(TimeSpan interval)
    {
        _interval = interval;
    }

    public TimeSpan GetWaitTime(int retryAttempt)
    {
        return _interval;
    }
}

/// <summary>
/// Linear backoff retry strategy
/// </summary>
public class LinearBackoffRetryStrategy : IRetryStrategy
{
    private readonly TimeSpan _initialInterval;
    private readonly TimeSpan _increment;

    public LinearBackoffRetryStrategy(TimeSpan initialInterval, TimeSpan increment)
    {
        _initialInterval = initialInterval;
        _increment = increment;
    }

    public TimeSpan GetWaitTime(int retryAttempt)
    {
        return _initialInterval + TimeSpan.FromTicks(_increment.Ticks * (retryAttempt - 1));
    }
}

/// <summary>
/// Exponential backoff retry strategy
/// </summary>
public class ExponentialBackoffRetryStrategy : IRetryStrategy
{
    private readonly TimeSpan _initialInterval;
    private readonly TimeSpan _maxInterval;
    private readonly double _multiplier;

    public ExponentialBackoffRetryStrategy(
        TimeSpan initialInterval,
        TimeSpan maxInterval,
        double multiplier = 2.0)
    {
        _initialInterval = initialInterval;
        _maxInterval = maxInterval;
        _multiplier = multiplier;
    }

    public TimeSpan GetWaitTime(int retryAttempt)
    {
        double intervalMilliseconds = _initialInterval.TotalMilliseconds *
                                      Math.Pow(_multiplier, retryAttempt - 1);

        TimeSpan calculatedInterval = TimeSpan.FromMilliseconds(intervalMilliseconds);

        return calculatedInterval > _maxInterval ? _maxInterval : calculatedInterval;
    }
}

/// <summary>
/// Exponential backoff with jitter to prevent thundering herd
/// </summary>
public class ExponentialBackoffWithJitterRetryStrategy : IRetryStrategy
{
    private readonly TimeSpan _initialInterval;
    private readonly TimeSpan _maxInterval;
    private readonly double _multiplier;
    private readonly Random _random;

    public ExponentialBackoffWithJitterRetryStrategy(
        TimeSpan initialInterval,
        TimeSpan maxInterval,
        double multiplier = 2.0)
    {
        _initialInterval = initialInterval;
        _maxInterval = maxInterval;
        _multiplier = multiplier;
        _random = new Random();
    }

    public TimeSpan GetWaitTime(int retryAttempt)
    {
        double baseInterval = _initialInterval.TotalMilliseconds *
                             Math.Pow(_multiplier, retryAttempt - 1);

        // Add jitter: random value between 0 and baseInterval
        double jitter = _random.NextDouble() * baseInterval;
        double intervalWithJitter = baseInterval + jitter;

        TimeSpan calculatedInterval = TimeSpan.FromMilliseconds(intervalWithJitter);

        return calculatedInterval > _maxInterval ? _maxInterval : calculatedInterval;
    }
}

/// <summary>
/// Decorrelated jitter retry strategy (AWS recommended)
/// </summary>
public class DecorrelatedJitterRetryStrategy : IRetryStrategy
{
    private readonly TimeSpan _baseInterval;
    private readonly TimeSpan _maxInterval;
    private readonly Random _random;
    private double _lastWait;

    public DecorrelatedJitterRetryStrategy(TimeSpan baseInterval, TimeSpan maxInterval)
    {
        _baseInterval = baseInterval;
        _maxInterval = maxInterval;
        _random = new Random();
        _lastWait = baseInterval.TotalMilliseconds;
    }

    public TimeSpan GetWaitTime(int retryAttempt)
    {
        double nextWait = _random.NextDouble() * (_lastWait * 3 - _baseInterval.TotalMilliseconds) +
                         _baseInterval.TotalMilliseconds;

        _lastWait = Math.Min(nextWait, _maxInterval.TotalMilliseconds);

        return TimeSpan.FromMilliseconds(_lastWait);
    }
}

/// <summary>
/// Retry policy with configurable strategy
/// </summary>
public class RetryPolicy<T> : IRetryPolicy<T>
{
    private readonly int _maxRetries;
    private readonly IRetryStrategy _strategy;
    private readonly Func<Exception, bool> _shouldRetry;
    private int _retryCount;

    public int MaxRetries => _maxRetries;
    public int RetryCount => _retryCount;

    public RetryPolicy(
        int maxRetries,
        IRetryStrategy strategy,
        Func<Exception, bool> shouldRetry = null)
    {
        if (maxRetries <= 0)
        {
            throw new ArgumentException("Max retries must be greater than 0", nameof(maxRetries));
        }

        _maxRetries = maxRetries;
        _strategy = strategy ?? new FixedIntervalRetryStrategy(TimeSpan.FromSeconds(1));
        _shouldRetry = shouldRetry ?? (ex => true); // Retry all exceptions by default
    }

    public async Task<T> ExecuteAsync(Func<Task<T>> operation)
    {
        _retryCount = 0;
        Exception lastException = null;

        for (int attempt = 1; attempt <= _maxRetries + 1; attempt++)
        {
            try
            {
                T result = await operation();
                return result;
            }
            catch (Exception ex)
            {
                lastException = ex;

                if (!_shouldRetry(ex))
                {
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Exception not retryable: {ex.GetType().Name}");
                    throw;
                }

                if (attempt > _maxRetries)
                {
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Max retries ({_maxRetries}) reached");
                    throw new RetryExhaustedException(_maxRetries, ex);
                }

                _retryCount++;
                TimeSpan waitTime = _strategy.GetWaitTime(attempt);

                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Attempt {attempt} failed: {ex.Message}. Retrying in {waitTime.TotalMilliseconds}ms...");

                await Task.Delay(waitTime);
            }
        }

        throw new RetryExhaustedException(_maxRetries, lastException);
    }
}

/// <summary>
/// Advanced retry policy with timeout
/// </summary>
public class AdvancedRetryPolicy<T>
{
    private readonly int _maxRetries;
    private readonly IRetryStrategy _strategy;
    private readonly TimeSpan _timeout;
    private readonly Func<Exception, bool> _shouldRetry;
    private readonly Action<int, Exception> _onRetry;

    public AdvancedRetryPolicy(
        int maxRetries,
        IRetryStrategy strategy,
        TimeSpan timeout,
        Func<Exception, bool> shouldRetry = null,
        Action<int, Exception> onRetry = null)
    {
        _maxRetries = maxRetries;
        _strategy = strategy;
        _timeout = timeout;
        _shouldRetry = shouldRetry ?? (ex => true);
        _onRetry = onRetry;
    }

    public async Task<T> ExecuteAsync(Func<Task<T>> operation)
    {
        DateTime startTime = DateTime.UtcNow;
        Exception lastException = null;

        for (int attempt = 1; attempt <= _maxRetries + 1; attempt++)
        {
            // Check if we've exceeded the total timeout
            if (DateTime.UtcNow - startTime >= _timeout)
            {
                throw new TimeoutException(
                    $"Operation timed out after {_timeout.TotalSeconds} seconds and {attempt - 1} attempts");
            }

            try
            {
                using (CancellationTokenSource cts = new CancellationTokenSource(_timeout - (DateTime.UtcNow - startTime)))
                {
                    return await operation();
                }
            }
            catch (Exception ex)
            {
                lastException = ex;

                if (!_shouldRetry(ex))
                {
                    throw;
                }

                if (attempt > _maxRetries)
                {
                    throw new RetryExhaustedException(_maxRetries, ex);
                }

                _onRetry?.Invoke(attempt, ex);

                TimeSpan waitTime = _strategy.GetWaitTime(attempt);
                await Task.Delay(waitTime);
            }
        }

        throw new RetryExhaustedException(_maxRetries, lastException);
    }
}

/// <summary>
/// Transient failure service simulator
/// </summary>
public class TransientFailureService
{
    private readonly Random _random = new Random();
    private int _callCount;
    private readonly int _failuresBeforeSuccess;

    public int CallCount => _callCount;

    public TransientFailureService(int failuresBeforeSuccess = 3)
    {
        _failuresBeforeSuccess = failuresBeforeSuccess;
    }

    public async Task<string> CallServiceAsync()
    {
        Interlocked.Increment(ref _callCount);

        await Task.Delay(100); // Simulate network delay

        if (_callCount <= _failuresBeforeSuccess)
        {
            throw new InvalidOperationException($"Transient failure #{_callCount}");
        }

        return $"Success after {_callCount} attempts";
    }

    public async Task<string> CallUnreliableServiceAsync(double failureRate = 0.7)
    {
        await Task.Delay(50);

        if (_random.NextDouble() < failureRate)
        {
            throw new InvalidOperationException("Service temporarily unavailable");
        }

        return "Success";
    }
}

/// <summary>
/// Retry policy builder for fluent configuration
/// </summary>
public class RetryPolicyBuilder<T>
{
    private int _maxRetries = 3;
    private IRetryStrategy _strategy;
    private Func<Exception, bool> _shouldRetry;
    private TimeSpan _timeout = TimeSpan.FromMinutes(5);
    private Action<int, Exception> _onRetry;

    public RetryPolicyBuilder<T> WithMaxRetries(int maxRetries)
    {
        _maxRetries = maxRetries;
        return this;
    }

    public RetryPolicyBuilder<T> WithFixedInterval(TimeSpan interval)
    {
        _strategy = new FixedIntervalRetryStrategy(interval);
        return this;
    }

    public RetryPolicyBuilder<T> WithExponentialBackoff(
        TimeSpan initialInterval,
        TimeSpan maxInterval,
        double multiplier = 2.0)
    {
        _strategy = new ExponentialBackoffRetryStrategy(initialInterval, maxInterval, multiplier);
        return this;
    }

    public RetryPolicyBuilder<T> WithExponentialBackoffAndJitter(
        TimeSpan initialInterval,
        TimeSpan maxInterval,
        double multiplier = 2.0)
    {
        _strategy = new ExponentialBackoffWithJitterRetryStrategy(initialInterval, maxInterval, multiplier);
        return this;
    }

    public RetryPolicyBuilder<T> WithDecorrelatedJitter(TimeSpan baseInterval, TimeSpan maxInterval)
    {
        _strategy = new DecorrelatedJitterRetryStrategy(baseInterval, maxInterval);
        return this;
    }

    public RetryPolicyBuilder<T> WithTimeout(TimeSpan timeout)
    {
        _timeout = timeout;
        return this;
    }

    public RetryPolicyBuilder<T> HandleException<TException>() where TException : Exception
    {
        _shouldRetry = ex => ex is TException;
        return this;
    }

    public RetryPolicyBuilder<T> HandleExceptionWhen(Func<Exception, bool> predicate)
    {
        _shouldRetry = predicate;
        return this;
    }

    public RetryPolicyBuilder<T> OnRetry(Action<int, Exception> onRetry)
    {
        _onRetry = onRetry;
        return this;
    }

    public AdvancedRetryPolicy<T> Build()
    {
        if (_strategy == null)
        {
            _strategy = new ExponentialBackoffRetryStrategy(
                TimeSpan.FromSeconds(1),
                TimeSpan.FromSeconds(30));
        }

        return new AdvancedRetryPolicy<T>(
            _maxRetries,
            _strategy,
            _timeout,
            _shouldRetry,
            _onRetry);
    }
}

/// <summary>
/// Retry statistics tracker
/// </summary>
public class RetryStatistics
{
    private readonly Dictionary<string, OperationStats> _stats = new Dictionary<string, OperationStats>();
    private readonly object _lock = new object();

    public void RecordAttempt(string operationName, bool success, int attempts)
    {
        lock (_lock)
        {
            if (!_stats.ContainsKey(operationName))
            {
                _stats[operationName] = new OperationStats();
            }

            OperationStats stats = _stats[operationName];
            stats.TotalOperations++;
            stats.TotalAttempts += attempts;

            if (success)
            {
                stats.SuccessfulOperations++;
            }
            else
            {
                stats.FailedOperations++;
            }
        }
    }

    public string GetReport()
    {
        lock (_lock)
        {
            System.Text.StringBuilder report = new System.Text.StringBuilder();
            report.AppendLine("Retry Statistics Report:");
            report.AppendLine(new string('-', 60));

            foreach (KeyValuePair<string, OperationStats> kvp in _stats)
            {
                OperationStats stats = kvp.Value;
                double averageAttempts = stats.TotalOperations > 0
                    ? (double)stats.TotalAttempts / stats.TotalOperations
                    : 0;

                report.AppendLine($"\nOperation: {kvp.Key}");
                report.AppendLine($"  Total Operations: {stats.TotalOperations}");
                report.AppendLine($"  Successful: {stats.SuccessfulOperations}");
                report.AppendLine($"  Failed: {stats.FailedOperations}");
                report.AppendLine($"  Total Attempts: {stats.TotalAttempts}");
                report.AppendLine($"  Average Attempts: {averageAttempts:F2}");
            }

            return report.ToString();
        }
    }

    private class OperationStats
    {
        public int TotalOperations { get; set; }
        public int SuccessfulOperations { get; set; }
        public int FailedOperations { get; set; }
        public int TotalAttempts { get; set; }
    }
}
