using System;
using System.Threading;
using System.Threading.Tasks;

namespace Cloud.CircuitBreaker;

/// <summary>
/// Implementation of CircuitBreaker pattern.
/// Handles faults that might take variable time to fix
/// </summary>
public class CircuitBreakerImplementation : ICircuitBreaker
{
    public void Execute()
    {
        Console.WriteLine("CircuitBreaker pattern executing...");
    }
}

/// <summary>
/// Generic circuit breaker implementation with configurable thresholds
/// </summary>
public class CircuitBreaker<T> : ICircuitBreaker<T>
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _timeout;
    private readonly TimeSpan _resetTimeout;
    private int _failureCount;
    private DateTime? _lastFailureTime;
    private CircuitState _state;
    private readonly object _lock = new object();

    public CircuitState State
    {
        get
        {
            lock (_lock)
            {
                return _state;
            }
        }
    }

    public int FailureCount
    {
        get
        {
            lock (_lock)
            {
                return _failureCount;
            }
        }
    }

    public DateTime? LastFailureTime
    {
        get
        {
            lock (_lock)
            {
                return _lastFailureTime;
            }
        }
    }

    public CircuitBreaker(int failureThreshold = 5, int timeoutSeconds = 60, int resetTimeoutSeconds = 30)
    {
        if (failureThreshold <= 0)
        {
            throw new ArgumentException("Failure threshold must be greater than 0", nameof(failureThreshold));
        }

        _failureThreshold = failureThreshold;
        _timeout = TimeSpan.FromSeconds(timeoutSeconds);
        _resetTimeout = TimeSpan.FromSeconds(resetTimeoutSeconds);
        _state = CircuitState.Closed;
        _failureCount = 0;
    }

    public async Task<T> ExecuteAsync(Func<Task<T>> operation)
    {
        if (operation == null)
        {
            throw new ArgumentNullException(nameof(operation));
        }

        lock (_lock)
        {
            if (_state == CircuitState.Open)
            {
                // Check if timeout period has elapsed
                if (DateTime.UtcNow - _lastFailureTime >= _timeout)
                {
                    // Move to half-open state to test the service
                    _state = CircuitState.HalfOpen;
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Circuit breaker moving to Half-Open state");
                }
                else
                {
                    throw new CircuitBreakerOpenException(
                        $"Circuit breaker is open. Retry after {_timeout - (DateTime.UtcNow - _lastFailureTime.Value)}");
                }
            }
        }

        try
        {
            T result = await operation();
            OnSuccess();
            return result;
        }
        catch (Exception ex)
        {
            OnFailure(ex);
            throw;
        }
    }

    private void OnSuccess()
    {
        lock (_lock)
        {
            if (_state == CircuitState.HalfOpen)
            {
                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Service recovered. Closing circuit breaker.");
            }

            _failureCount = 0;
            _state = CircuitState.Closed;
            _lastFailureTime = null;
        }
    }

    private void OnFailure(Exception exception)
    {
        lock (_lock)
        {
            _failureCount++;
            _lastFailureTime = DateTime.UtcNow;

            Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Failure #{_failureCount}: {exception.Message}");

            if (_state == CircuitState.HalfOpen)
            {
                // If we fail in half-open state, immediately trip the circuit
                _state = CircuitState.Open;
                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Service still failing. Circuit breaker opened.");
            }
            else if (_failureCount >= _failureThreshold)
            {
                _state = CircuitState.Open;
                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Failure threshold reached. Circuit breaker opened for {_timeout.TotalSeconds} seconds.");
            }
        }
    }

    public void Reset()
    {
        lock (_lock)
        {
            _failureCount = 0;
            _state = CircuitState.Closed;
            _lastFailureTime = null;
            Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Circuit breaker manually reset.");
        }
    }
}

/// <summary>
/// Simulated external service that can fail
/// </summary>
public class ExternalService
{
    private readonly Random _random = new Random();
    private readonly double _failureRate;
    private int _callCount;

    public int CallCount => _callCount;

    public ExternalService(double failureRate = 0.5)
    {
        _failureRate = failureRate;
    }

    public async Task<string> CallServiceAsync()
    {
        Interlocked.Increment(ref _callCount);

        // Simulate network delay
        await Task.Delay(100);

        if (_random.NextDouble() < _failureRate)
        {
            throw new InvalidOperationException("Service temporarily unavailable");
        }

        return $"Success response #{_callCount}";
    }

    public void SetHealthy()
    {
        // Simulate service recovery
        Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] External service is now healthy");
    }
}

/// <summary>
/// Circuit breaker with Polly-like policy configuration
/// </summary>
public class AdvancedCircuitBreaker<T>
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _samplingDuration;
    private readonly TimeSpan _durationOfBreak;
    private readonly int _minimumThroughput;
    private CircuitState _state;
    private int _successCount;
    private int _failureCount;
    private DateTime _stateChangedTime;
    private readonly object _lock = new object();

    public CircuitState State => _state;

    public AdvancedCircuitBreaker(
        int failureThreshold = 5,
        int samplingDurationSeconds = 60,
        int durationOfBreakSeconds = 30,
        int minimumThroughput = 10)
    {
        _failureThreshold = failureThreshold;
        _samplingDuration = TimeSpan.FromSeconds(samplingDurationSeconds);
        _durationOfBreak = TimeSpan.FromSeconds(durationOfBreakSeconds);
        _minimumThroughput = minimumThroughput;
        _state = CircuitState.Closed;
        _stateChangedTime = DateTime.UtcNow;
    }

    public async Task<T> ExecuteAsync(Func<Task<T>> operation)
    {
        lock (_lock)
        {
            // Reset statistics if sampling duration has elapsed
            if (DateTime.UtcNow - _stateChangedTime >= _samplingDuration)
            {
                _successCount = 0;
                _failureCount = 0;
                _stateChangedTime = DateTime.UtcNow;
            }

            if (_state == CircuitState.Open)
            {
                if (DateTime.UtcNow - _stateChangedTime >= _durationOfBreak)
                {
                    _state = CircuitState.HalfOpen;
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Advanced circuit breaker: Half-Open");
                }
                else
                {
                    throw new CircuitBreakerOpenException();
                }
            }
        }

        try
        {
            T result = await operation();
            RecordSuccess();
            return result;
        }
        catch
        {
            RecordFailure();
            throw;
        }
    }

    private void RecordSuccess()
    {
        lock (_lock)
        {
            _successCount++;

            if (_state == CircuitState.HalfOpen)
            {
                _state = CircuitState.Closed;
                _stateChangedTime = DateTime.UtcNow;
                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Advanced circuit breaker: Closed");
            }
        }
    }

    private void RecordFailure()
    {
        lock (_lock)
        {
            _failureCount++;

            int totalCalls = _successCount + _failureCount;

            if (totalCalls >= _minimumThroughput)
            {
                double failureRate = (double)_failureCount / totalCalls;

                if (failureRate >= (double)_failureThreshold / 100)
                {
                    _state = CircuitState.Open;
                    _stateChangedTime = DateTime.UtcNow;
                    Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Advanced circuit breaker: Open (Failure rate: {failureRate:P})");
                }
            }
        }
    }
}
