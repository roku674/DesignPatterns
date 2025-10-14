using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace Cloud.Ambassador;

/// <summary>
/// Implementation of Ambassador pattern.
/// Creates helper services that send network requests on behalf of consumer,
/// handling cross-cutting concerns like retry, circuit breaking, logging, and load balancing.
/// </summary>
public class AmbassadorImplementation : IAmbassador
{
    public void Execute()
    {
        Console.WriteLine("Ambassador pattern executing...");
        Console.WriteLine("This pattern creates proxy services that handle network communication concerns.\n");
    }
}

/// <summary>
/// Represents a remote service endpoint
/// </summary>
public class ServiceEndpoint
{
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsHealthy { get; set; }
    public DateTime LastHealthCheck { get; set; }
    public int FailureCount { get; set; }
    public TimeSpan ResponseTime { get; set; }

    public ServiceEndpoint(string name, string url)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Url = url ?? throw new ArgumentNullException(nameof(url));
        IsHealthy = true;
        LastHealthCheck = DateTime.UtcNow;
        FailureCount = 0;
        ResponseTime = TimeSpan.Zero;
    }
}

/// <summary>
/// Load balancing strategies for distributing requests
/// </summary>
public enum LoadBalancingStrategy
{
    RoundRobin,
    LeastConnections,
    WeightedRandom,
    LeastResponseTime
}

/// <summary>
/// Ambassador service that acts as a proxy for external service calls
/// Implements retry logic, circuit breaking, logging, and load balancing
/// </summary>
public class ServiceAmbassador
{
    private readonly List<ServiceEndpoint> _endpoints;
    private readonly LoadBalancingStrategy _strategy;
    private int _currentEndpointIndex;
    private readonly Dictionary<string, int> _activeConnections;
    private readonly int _maxRetries;
    private readonly TimeSpan _retryDelay;
    private readonly TimeSpan _circuitBreakerTimeout;
    private readonly int _circuitBreakerThreshold;
    private readonly object _lock = new object();
    private readonly Random _random = new Random();

    public ServiceAmbassador(
        List<ServiceEndpoint> endpoints,
        LoadBalancingStrategy strategy = LoadBalancingStrategy.RoundRobin,
        int maxRetries = 3,
        int circuitBreakerThreshold = 5)
    {
        if (endpoints == null || endpoints.Count == 0)
            throw new ArgumentException("At least one endpoint must be provided", nameof(endpoints));

        _endpoints = endpoints;
        _strategy = strategy;
        _currentEndpointIndex = 0;
        _activeConnections = new Dictionary<string, int>();
        _maxRetries = maxRetries;
        _retryDelay = TimeSpan.FromSeconds(1);
        _circuitBreakerTimeout = TimeSpan.FromSeconds(30);
        _circuitBreakerThreshold = circuitBreakerThreshold;

        foreach (ServiceEndpoint endpoint in endpoints)
        {
            _activeConnections[endpoint.Name] = 0;
        }
    }

    /// <summary>
    /// Executes a request through the ambassador with retry and circuit breaker logic
    /// </summary>
    public async Task<T> ExecuteAsync<T>(Func<string, Task<T>> operation, string operationName)
    {
        if (operation == null)
            throw new ArgumentNullException(nameof(operation));

        int retryCount = 0;
        Exception lastException = null;

        while (retryCount <= _maxRetries)
        {
            ServiceEndpoint endpoint = SelectEndpoint();

            if (endpoint == null)
            {
                throw new InvalidOperationException("No healthy endpoints available");
            }

            try
            {
                Console.WriteLine($"[Ambassador] Attempting {operationName} on {endpoint.Name} (Attempt {retryCount + 1})");

                IncrementActiveConnections(endpoint.Name);
                DateTime startTime = DateTime.UtcNow;

                T result = await operation(endpoint.Url);

                TimeSpan responseTime = DateTime.UtcNow - startTime;
                HandleSuccess(endpoint, responseTime);

                Console.WriteLine($"[Ambassador] Success on {endpoint.Name} (Response time: {responseTime.TotalMilliseconds}ms)");

                return result;
            }
            catch (Exception ex)
            {
                lastException = ex;
                HandleFailure(endpoint, ex);

                Console.WriteLine($"[Ambassador] Failure on {endpoint.Name}: {ex.Message}");

                if (retryCount < _maxRetries)
                {
                    TimeSpan delay = CalculateRetryDelay(retryCount);
                    Console.WriteLine($"[Ambassador] Retrying in {delay.TotalSeconds}s...");
                    await Task.Delay(delay);
                }

                retryCount++;
            }
            finally
            {
                DecrementActiveConnections(endpoint.Name);
            }
        }

        throw new AggregateException($"Operation {operationName} failed after {_maxRetries} retries", lastException);
    }

    /// <summary>
    /// Selects an endpoint based on the configured load balancing strategy
    /// </summary>
    private ServiceEndpoint SelectEndpoint()
    {
        lock (_lock)
        {
            List<ServiceEndpoint> healthyEndpoints = _endpoints.Where(e => IsEndpointAvailable(e)).ToList();

            if (healthyEndpoints.Count == 0)
            {
                Console.WriteLine("[Ambassador] No healthy endpoints available, attempting recovery...");
                AttemptCircuitBreakerRecovery();
                healthyEndpoints = _endpoints.Where(e => IsEndpointAvailable(e)).ToList();
            }

            if (healthyEndpoints.Count == 0)
            {
                return null;
            }

            return _strategy switch
            {
                LoadBalancingStrategy.RoundRobin => SelectRoundRobin(healthyEndpoints),
                LoadBalancingStrategy.LeastConnections => SelectLeastConnections(healthyEndpoints),
                LoadBalancingStrategy.WeightedRandom => SelectWeightedRandom(healthyEndpoints),
                LoadBalancingStrategy.LeastResponseTime => SelectLeastResponseTime(healthyEndpoints),
                _ => healthyEndpoints[0]
            };
        }
    }

    /// <summary>
    /// Round-robin load balancing
    /// </summary>
    private ServiceEndpoint SelectRoundRobin(List<ServiceEndpoint> endpoints)
    {
        ServiceEndpoint selected = endpoints[_currentEndpointIndex % endpoints.Count];
        _currentEndpointIndex++;
        return selected;
    }

    /// <summary>
    /// Least connections load balancing
    /// </summary>
    private ServiceEndpoint SelectLeastConnections(List<ServiceEndpoint> endpoints)
    {
        return endpoints.OrderBy(e => _activeConnections[e.Name]).First();
    }

    /// <summary>
    /// Weighted random load balancing (weighted by inverse failure count)
    /// </summary>
    private ServiceEndpoint SelectWeightedRandom(List<ServiceEndpoint> endpoints)
    {
        int totalWeight = endpoints.Sum(e => Math.Max(1, 10 - e.FailureCount));
        int randomValue = _random.Next(totalWeight);
        int cumulativeWeight = 0;

        foreach (ServiceEndpoint endpoint in endpoints)
        {
            cumulativeWeight += Math.Max(1, 10 - endpoint.FailureCount);
            if (randomValue < cumulativeWeight)
            {
                return endpoint;
            }
        }

        return endpoints.Last();
    }

    /// <summary>
    /// Least response time load balancing
    /// </summary>
    private ServiceEndpoint SelectLeastResponseTime(List<ServiceEndpoint> endpoints)
    {
        return endpoints.OrderBy(e => e.ResponseTime.TotalMilliseconds).First();
    }

    /// <summary>
    /// Checks if an endpoint is available (healthy and not circuit broken)
    /// </summary>
    private bool IsEndpointAvailable(ServiceEndpoint endpoint)
    {
        if (!endpoint.IsHealthy && endpoint.FailureCount >= _circuitBreakerThreshold)
        {
            // Circuit breaker is open, check if timeout has elapsed
            TimeSpan timeSinceLastCheck = DateTime.UtcNow - endpoint.LastHealthCheck;
            return timeSinceLastCheck >= _circuitBreakerTimeout;
        }

        return endpoint.IsHealthy || endpoint.FailureCount < _circuitBreakerThreshold;
    }

    /// <summary>
    /// Attempts to recover endpoints that have circuit breaker timeout elapsed
    /// </summary>
    private void AttemptCircuitBreakerRecovery()
    {
        foreach (ServiceEndpoint endpoint in _endpoints)
        {
            if (!endpoint.IsHealthy && endpoint.FailureCount >= _circuitBreakerThreshold)
            {
                TimeSpan timeSinceLastCheck = DateTime.UtcNow - endpoint.LastHealthCheck;
                if (timeSinceLastCheck >= _circuitBreakerTimeout)
                {
                    Console.WriteLine($"[Ambassador] Attempting to recover {endpoint.Name} (circuit breaker half-open)");
                    endpoint.FailureCount = _circuitBreakerThreshold - 1; // Give it another chance
                    endpoint.LastHealthCheck = DateTime.UtcNow;
                }
            }
        }
    }

    /// <summary>
    /// Handles successful request
    /// </summary>
    private void HandleSuccess(ServiceEndpoint endpoint, TimeSpan responseTime)
    {
        lock (_lock)
        {
            endpoint.IsHealthy = true;
            endpoint.FailureCount = Math.Max(0, endpoint.FailureCount - 1);
            endpoint.ResponseTime = responseTime;
            endpoint.LastHealthCheck = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// Handles failed request and implements circuit breaker logic
    /// </summary>
    private void HandleFailure(ServiceEndpoint endpoint, Exception ex)
    {
        lock (_lock)
        {
            endpoint.FailureCount++;
            endpoint.LastHealthCheck = DateTime.UtcNow;

            if (endpoint.FailureCount >= _circuitBreakerThreshold)
            {
                endpoint.IsHealthy = false;
                Console.WriteLine($"[Ambassador] Circuit breaker OPEN for {endpoint.Name} (failures: {endpoint.FailureCount})");
            }
        }
    }

    /// <summary>
    /// Calculates exponential backoff delay for retries
    /// </summary>
    private TimeSpan CalculateRetryDelay(int retryCount)
    {
        double exponentialBackoff = Math.Pow(2, retryCount);
        return TimeSpan.FromSeconds(exponentialBackoff);
    }

    private void IncrementActiveConnections(string endpointName)
    {
        lock (_lock)
        {
            _activeConnections[endpointName]++;
        }
    }

    private void DecrementActiveConnections(string endpointName)
    {
        lock (_lock)
        {
            _activeConnections[endpointName]--;
        }
    }

    /// <summary>
    /// Gets current status of all endpoints
    /// </summary>
    public List<EndpointStatus> GetEndpointStatus()
    {
        lock (_lock)
        {
            return _endpoints.Select(e => new EndpointStatus
            {
                Name = e.Name,
                Url = e.Url,
                IsHealthy = e.IsHealthy,
                FailureCount = e.FailureCount,
                ActiveConnections = _activeConnections[e.Name],
                ResponseTime = e.ResponseTime,
                LastHealthCheck = e.LastHealthCheck
            }).ToList();
        }
    }
}

/// <summary>
/// Represents the status of an endpoint
/// </summary>
public class EndpointStatus
{
    public string Name { get; set; }
    public string Url { get; set; }
    public bool IsHealthy { get; set; }
    public int FailureCount { get; set; }
    public int ActiveConnections { get; set; }
    public TimeSpan ResponseTime { get; set; }
    public DateTime LastHealthCheck { get; set; }

    public override string ToString()
    {
        string status = IsHealthy ? "HEALTHY" : "UNHEALTHY";
        return $"{Name} [{status}] - Failures: {FailureCount}, Active: {ActiveConnections}, " +
               $"Response: {ResponseTime.TotalMilliseconds:F0}ms";
    }
}

/// <summary>
/// Simulated external service for demonstration
/// </summary>
public class ExternalService
{
    private readonly string _name;
    private readonly double _failureRate;
    private readonly Random _random = new Random();

    public ExternalService(string name, double failureRate = 0.0)
    {
        _name = name;
        _failureRate = failureRate;
    }

    public async Task<string> GetDataAsync(string url)
    {
        // Simulate network delay
        await Task.Delay(_random.Next(50, 200));

        // Simulate random failures
        if (_random.NextDouble() < _failureRate)
        {
            throw new HttpRequestException($"Service {_name} temporarily unavailable");
        }

        return $"Data from {_name} at {url}";
    }

    public async Task<int> ProcessRequestAsync(string url, int value)
    {
        await Task.Delay(_random.Next(100, 300));

        if (_random.NextDouble() < _failureRate)
        {
            throw new InvalidOperationException($"Processing failed on {_name}");
        }

        return value * 2;
    }
}

/// <summary>
/// Client application that uses the Ambassador to communicate with external services
/// </summary>
public class ClientApplication
{
    private readonly ServiceAmbassador _ambassador;
    private readonly ExternalService _service;

    public ClientApplication(ServiceAmbassador ambassador)
    {
        _ambassador = ambassador ?? throw new ArgumentNullException(nameof(ambassador));
        _service = new ExternalService("ExternalAPI");
    }

    public async Task<string> FetchDataAsync(string resourceId)
    {
        return await _ambassador.ExecuteAsync(
            async (url) => await _service.GetDataAsync($"{url}/api/resource/{resourceId}"),
            $"FetchData({resourceId})"
        );
    }

    public async Task<int> ProcessDataAsync(int value)
    {
        return await _ambassador.ExecuteAsync(
            async (url) => await _service.ProcessRequestAsync($"{url}/api/process", value),
            $"ProcessData({value})"
        );
    }
}

/// <summary>
/// Logging decorator for the Ambassador pattern
/// </summary>
public class LoggingAmbassador : ServiceAmbassador
{
    private readonly List<string> _requestLog;

    public LoggingAmbassador(
        List<ServiceEndpoint> endpoints,
        LoadBalancingStrategy strategy = LoadBalancingStrategy.RoundRobin)
        : base(endpoints, strategy)
    {
        _requestLog = new List<string>();
    }

    public List<string> GetRequestLog()
    {
        return new List<string>(_requestLog);
    }

    public void ClearLog()
    {
        _requestLog.Clear();
    }
}

/// <summary>
/// Metrics collector for the Ambassador
/// </summary>
public class AmbassadorMetrics
{
    private int _totalRequests;
    private int _successfulRequests;
    private int _failedRequests;
    private readonly List<TimeSpan> _responseTimes;
    private readonly object _lock = new object();

    public AmbassadorMetrics()
    {
        _responseTimes = new List<TimeSpan>();
    }

    public void RecordRequest(bool success, TimeSpan responseTime)
    {
        lock (_lock)
        {
            _totalRequests++;
            if (success)
            {
                _successfulRequests++;
                _responseTimes.Add(responseTime);
            }
            else
            {
                _failedRequests++;
            }
        }
    }

    public MetricsSnapshot GetSnapshot()
    {
        lock (_lock)
        {
            double successRate = _totalRequests > 0
                ? (_successfulRequests / (double)_totalRequests) * 100
                : 0;

            double avgResponseTime = _responseTimes.Count > 0
                ? _responseTimes.Average(t => t.TotalMilliseconds)
                : 0;

            return new MetricsSnapshot
            {
                TotalRequests = _totalRequests,
                SuccessfulRequests = _successfulRequests,
                FailedRequests = _failedRequests,
                SuccessRate = successRate,
                AverageResponseTime = avgResponseTime
            };
        }
    }
}

/// <summary>
/// Snapshot of Ambassador metrics
/// </summary>
public class MetricsSnapshot
{
    public int TotalRequests { get; set; }
    public int SuccessfulRequests { get; set; }
    public int FailedRequests { get; set; }
    public double SuccessRate { get; set; }
    public double AverageResponseTime { get; set; }

    public override string ToString()
    {
        return $"Total: {TotalRequests}, Success: {SuccessfulRequests}, " +
               $"Failed: {FailedRequests}, Success Rate: {SuccessRate:F1}%, " +
               $"Avg Response: {AverageResponseTime:F0}ms";
    }
}
