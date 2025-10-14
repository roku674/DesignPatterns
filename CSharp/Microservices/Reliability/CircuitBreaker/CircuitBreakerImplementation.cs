using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Microservices.Reliability.CircuitBreaker;

/// <summary>
/// Implementation of CircuitBreaker pattern.
/// Prevents cascading failures by stopping failing calls and allowing system recovery
/// </summary>
public class CircuitBreakerImplementation : ICircuitBreaker
{
    public void Execute()
    {
        Console.WriteLine("CircuitBreaker pattern executing...");
        Console.WriteLine("Demonstrating failure protection and automatic recovery\n");
    }
}

/// <summary>
/// Circuit breaker states
/// </summary>
public enum CircuitState
{
    Closed,    // Normal operation, requests flow through
    Open,      // Circuit is open, requests fail fast
    HalfOpen   // Testing if service has recovered
}

/// <summary>
/// Circuit breaker exception
/// </summary>
public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException(string message) : base(message)
    {
    }
}

/// <summary>
/// Circuit breaker configuration
/// </summary>
public class CircuitBreakerConfig
{
    public int FailureThreshold { get; set; } = 5;
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(60);
    public int SuccessThreshold { get; set; } = 2;
    public TimeSpan CallTimeout { get; set; } = TimeSpan.FromSeconds(5);
}

/// <summary>
/// Circuit breaker implementation
/// </summary>
public class CircuitBreaker
{
    private CircuitState state;
    private int failureCount;
    private int successCount;
    private DateTime lastFailureTime;
    private CircuitBreakerConfig config;
    private object lockObject = new object();
    private List<string> eventLog;

    public CircuitState State => state;
    public int FailureCount => failureCount;
    public int SuccessCount => successCount;

    public CircuitBreaker(CircuitBreakerConfig config = null)
    {
        this.config = config ?? new CircuitBreakerConfig();
        state = CircuitState.Closed;
        failureCount = 0;
        successCount = 0;
        eventLog = new List<string>();
        LogEvent($"Circuit Breaker initialized in {state} state");
    }

    /// <summary>
    /// Execute an action through the circuit breaker
    /// </summary>
    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
    {
        CheckState();

        if (state == CircuitState.Open)
        {
            LogEvent("Request rejected - Circuit is OPEN");
            throw new CircuitBreakerOpenException("Circuit breaker is open");
        }

        try
        {
            LogEvent($"Executing request in {state} state");

            // Create a timeout task
            Task<T> actionTask = action();
            Task timeoutTask = Task.Delay(config.CallTimeout);

            Task completedTask = await Task.WhenAny(actionTask, timeoutTask);

            if (completedTask == timeoutTask)
            {
                throw new TimeoutException("Operation timed out");
            }

            T result = await actionTask;
            OnSuccess();
            return result;
        }
        catch (Exception ex)
        {
            OnFailure(ex);
            throw;
        }
    }

    /// <summary>
    /// Execute an action through the circuit breaker (void return)
    /// </summary>
    public async Task ExecuteAsync(Func<Task> action)
    {
        await ExecuteAsync<object>(async () =>
        {
            await action();
            return null;
        });
    }

    /// <summary>
    /// Check and update circuit state based on timeout
    /// </summary>
    private void CheckState()
    {
        lock (lockObject)
        {
            if (state == CircuitState.Open)
            {
                if (DateTime.UtcNow - lastFailureTime >= config.Timeout)
                {
                    state = CircuitState.HalfOpen;
                    successCount = 0;
                    LogEvent("Circuit transitioning to HALF-OPEN state");
                }
            }
        }
    }

    /// <summary>
    /// Handle successful execution
    /// </summary>
    private void OnSuccess()
    {
        lock (lockObject)
        {
            failureCount = 0;

            if (state == CircuitState.HalfOpen)
            {
                successCount++;
                LogEvent($"Success in HALF-OPEN state ({successCount}/{config.SuccessThreshold})");

                if (successCount >= config.SuccessThreshold)
                {
                    state = CircuitState.Closed;
                    LogEvent("Circuit transitioned to CLOSED state");
                }
            }
            else
            {
                LogEvent("Request succeeded in CLOSED state");
            }
        }
    }

    /// <summary>
    /// Handle failed execution
    /// </summary>
    private void OnFailure(Exception exception)
    {
        lock (lockObject)
        {
            failureCount++;
            lastFailureTime = DateTime.UtcNow;
            LogEvent($"Request failed: {exception.Message} (Failures: {failureCount}/{config.FailureThreshold})");

            if (state == CircuitState.HalfOpen)
            {
                state = CircuitState.Open;
                LogEvent("Circuit opened from HALF-OPEN due to failure");
            }
            else if (failureCount >= config.FailureThreshold)
            {
                state = CircuitState.Open;
                LogEvent("Circuit OPENED due to failure threshold exceeded");
            }
        }
    }

    /// <summary>
    /// Manually reset the circuit breaker
    /// </summary>
    public void Reset()
    {
        lock (lockObject)
        {
            state = CircuitState.Closed;
            failureCount = 0;
            successCount = 0;
            LogEvent("Circuit breaker manually reset to CLOSED state");
        }
    }

    /// <summary>
    /// Manually trip the circuit breaker
    /// </summary>
    public void Trip()
    {
        lock (lockObject)
        {
            state = CircuitState.Open;
            lastFailureTime = DateTime.UtcNow;
            LogEvent("Circuit breaker manually tripped to OPEN state");
        }
    }

    /// <summary>
    /// Get circuit breaker statistics
    /// </summary>
    public Dictionary<string, object> GetStatistics()
    {
        return new Dictionary<string, object>
        {
            { "State", state.ToString() },
            { "FailureCount", failureCount },
            { "SuccessCount", successCount },
            { "FailureThreshold", config.FailureThreshold },
            { "SuccessThreshold", config.SuccessThreshold },
            { "Timeout", config.Timeout.TotalSeconds }
        };
    }

    /// <summary>
    /// Get event log
    /// </summary>
    public List<string> GetEventLog()
    {
        return new List<string>(eventLog);
    }

    private void LogEvent(string message)
    {
        string logEntry = $"[{DateTime.UtcNow:HH:mm:ss.fff}] {message}";
        eventLog.Add(logEntry);
    }
}

/// <summary>
/// Simulated external service that can fail
/// </summary>
public class ExternalService
{
    private int callCount = 0;
    private bool isHealthy = true;
    private Random random = new Random();

    public string ServiceName { get; set; }

    public ExternalService(string name)
    {
        ServiceName = name;
    }

    /// <summary>
    /// Simulate a service call that may fail
    /// </summary>
    public async Task<string> CallAsync()
    {
        callCount++;
        await Task.Delay(random.Next(50, 200)); // Simulate network latency

        if (!isHealthy)
        {
            throw new Exception($"{ServiceName} is currently unavailable");
        }

        if (random.Next(100) < 10) // 10% random failure rate when healthy
        {
            throw new Exception($"{ServiceName} encountered an error");
        }

        return $"{ServiceName} responded successfully (call #{callCount})";
    }

    /// <summary>
    /// Make the service unhealthy
    /// </summary>
    public void MakeUnhealthy()
    {
        isHealthy = false;
        Console.WriteLine($"[{ServiceName}] Service is now UNHEALTHY");
    }

    /// <summary>
    /// Make the service healthy again
    /// </summary>
    public void MakeHealthy()
    {
        isHealthy = true;
        Console.WriteLine($"[{ServiceName}] Service is now HEALTHY");
    }

    public bool IsHealthy => isHealthy;
}

/// <summary>
/// Service that uses circuit breaker to protect calls to external service
/// </summary>
public class ProtectedServiceClient
{
    private ExternalService externalService;
    private CircuitBreaker circuitBreaker;

    public ProtectedServiceClient(ExternalService service, CircuitBreaker breaker)
    {
        externalService = service;
        circuitBreaker = breaker;
    }

    /// <summary>
    /// Make a call to external service protected by circuit breaker
    /// </summary>
    public async Task<string> MakeCallAsync()
    {
        try
        {
            string result = await circuitBreaker.ExecuteAsync(() => externalService.CallAsync());
            Console.WriteLine($"[Client] Success: {result}");
            return result;
        }
        catch (CircuitBreakerOpenException ex)
        {
            Console.WriteLine($"[Client] Circuit breaker is open - failing fast");
            return "CIRCUIT_OPEN";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Client] Call failed: {ex.Message}");
            return "FAILED";
        }
    }

    /// <summary>
    /// Make a call with fallback behavior
    /// </summary>
    public async Task<string> MakeCallWithFallbackAsync()
    {
        try
        {
            return await circuitBreaker.ExecuteAsync(() => externalService.CallAsync());
        }
        catch (CircuitBreakerOpenException)
        {
            Console.WriteLine($"[Client] Using cached/fallback response");
            return "FALLBACK_RESPONSE";
        }
        catch (Exception)
        {
            Console.WriteLine($"[Client] Using cached/fallback response");
            return "FALLBACK_RESPONSE";
        }
    }
}

/// <summary>
/// Circuit breaker pool for managing multiple circuit breakers
/// </summary>
public class CircuitBreakerPool
{
    private Dictionary<string, CircuitBreaker> breakers;
    private CircuitBreakerConfig defaultConfig;

    public CircuitBreakerPool(CircuitBreakerConfig config = null)
    {
        breakers = new Dictionary<string, CircuitBreaker>();
        defaultConfig = config ?? new CircuitBreakerConfig();
    }

    /// <summary>
    /// Get or create a circuit breaker for a service
    /// </summary>
    public CircuitBreaker GetBreaker(string serviceName)
    {
        if (!breakers.ContainsKey(serviceName))
        {
            breakers[serviceName] = new CircuitBreaker(defaultConfig);
        }
        return breakers[serviceName];
    }

    /// <summary>
    /// Get all circuit breaker states
    /// </summary>
    public Dictionary<string, CircuitState> GetAllStates()
    {
        Dictionary<string, CircuitState> states = new Dictionary<string, CircuitState>();
        foreach (KeyValuePair<string, CircuitBreaker> entry in breakers)
        {
            states[entry.Key] = entry.Value.State;
        }
        return states;
    }

    /// <summary>
    /// Reset all circuit breakers
    /// </summary>
    public void ResetAll()
    {
        foreach (CircuitBreaker breaker in breakers.Values)
        {
            breaker.Reset();
        }
    }
}
