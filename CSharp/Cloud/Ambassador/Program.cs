using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cloud.Ambassador;

/// <summary>
/// Demonstrates the Ambassador Pattern with comprehensive scenarios
/// </summary>
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Ambassador Pattern Demo ===\n");
        Console.WriteLine("The Ambassador pattern creates helper services that send network requests");
        Console.WriteLine("on behalf of consumers, handling cross-cutting concerns like retry logic,");
        Console.WriteLine("circuit breaking, logging, and load balancing.\n");

        await RunScenario1_BasicAmbassador();
        await RunScenario2_LoadBalancingStrategies();
        await RunScenario3_CircuitBreakerDemo();
        await RunScenario4_RetryLogic();
        await RunScenario5_MultipleEndpoints();
        await RunScenario6_FailoverScenario();
        await RunScenario7_PerformanceMetrics();
        await RunScenario8_ClientApplication();

        Console.WriteLine("\n=== Demo Complete ===");
    }

    /// <summary>
    /// Scenario 1: Basic Ambassador with single endpoint
    /// </summary>
    private static async Task RunScenario1_BasicAmbassador()
    {
        Console.WriteLine("\n--- Scenario 1: Basic Ambassador ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("Primary", "https://api.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(endpoints);
        ExternalService service = new ExternalService("ExternalAPI", failureRate: 0.0);

        try
        {
            string result = await ambassador.ExecuteAsync(
                async (url) => await service.GetDataAsync($"{url}/api/users/123"),
                "GetUser"
            );

            Console.WriteLine($"Result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }

        // Display endpoint status
        Console.WriteLine("\nEndpoint Status:");
        foreach (EndpointStatus status in ambassador.GetEndpointStatus())
        {
            Console.WriteLine($"  {status}");
        }
    }

    /// <summary>
    /// Scenario 2: Demonstrating different load balancing strategies
    /// </summary>
    private static async Task RunScenario2_LoadBalancingStrategies()
    {
        Console.WriteLine("\n--- Scenario 2: Load Balancing Strategies ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("Server1", "https://server1.example.com"),
            new ServiceEndpoint("Server2", "https://server2.example.com"),
            new ServiceEndpoint("Server3", "https://server3.example.com")
        };

        // Round Robin
        Console.WriteLine("\nRound Robin Strategy:");
        ServiceAmbassador rrAmbassador = new ServiceAmbassador(
            endpoints,
            LoadBalancingStrategy.RoundRobin
        );

        ExternalService service = new ExternalService("RoundRobinAPI");

        for (int i = 0; i < 5; i++)
        {
            try
            {
                await rrAmbassador.ExecuteAsync(
                    async (url) => await service.GetDataAsync($"{url}/api/data"),
                    $"Request{i + 1}"
                );
            }
            catch
            {
                // Ignore failures for demonstration
            }
        }

        // Least Response Time
        Console.WriteLine("\nLeast Response Time Strategy:");
        ServiceAmbassador lrtAmbassador = new ServiceAmbassador(
            new List<ServiceEndpoint>
            {
                new ServiceEndpoint("FastServer", "https://fast.example.com"),
                new ServiceEndpoint("SlowServer", "https://slow.example.com")
            },
            LoadBalancingStrategy.LeastResponseTime
        );

        for (int i = 0; i < 3; i++)
        {
            try
            {
                await lrtAmbassador.ExecuteAsync(
                    async (url) => await service.GetDataAsync($"{url}/api/data"),
                    $"Request{i + 1}"
                );
            }
            catch
            {
                // Ignore failures
            }
        }
    }

    /// <summary>
    /// Scenario 3: Circuit Breaker demonstration
    /// </summary>
    private static async Task RunScenario3_CircuitBreakerDemo()
    {
        Console.WriteLine("\n--- Scenario 3: Circuit Breaker ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("UnreliableServer", "https://unreliable.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(
            endpoints,
            maxRetries: 2,
            circuitBreakerThreshold: 3
        );

        // Create a service with high failure rate
        ExternalService service = new ExternalService("UnreliableAPI", failureRate: 0.9);

        Console.WriteLine("Sending requests to trigger circuit breaker...\n");

        for (int i = 0; i < 5; i++)
        {
            try
            {
                await ambassador.ExecuteAsync(
                    async (url) => await service.GetDataAsync($"{url}/api/data"),
                    $"Request{i + 1}"
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request {i + 1} failed: {ex.Message}");
            }

            Console.WriteLine();
        }

        Console.WriteLine("Final endpoint status:");
        foreach (EndpointStatus status in ambassador.GetEndpointStatus())
        {
            Console.WriteLine($"  {status}");
        }
    }

    /// <summary>
    /// Scenario 4: Retry logic with exponential backoff
    /// </summary>
    private static async Task RunScenario4_RetryLogic()
    {
        Console.WriteLine("\n--- Scenario 4: Retry Logic ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("RetryServer", "https://retry.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(endpoints, maxRetries: 3);
        ExternalService service = new ExternalService("RetryAPI", failureRate: 0.7);

        Console.WriteLine("Attempting request with retry logic...\n");

        try
        {
            string result = await ambassador.ExecuteAsync(
                async (url) => await service.GetDataAsync($"{url}/api/data"),
                "RetryableOperation"
            );

            Console.WriteLine($"\nSuccess! Result: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nAll retries exhausted: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 5: Multiple endpoints with automatic failover
    /// </summary>
    private static async Task RunScenario5_MultipleEndpoints()
    {
        Console.WriteLine("\n--- Scenario 5: Multiple Endpoints ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("Primary", "https://primary.example.com"),
            new ServiceEndpoint("Secondary", "https://secondary.example.com"),
            new ServiceEndpoint("Tertiary", "https://tertiary.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(
            endpoints,
            LoadBalancingStrategy.RoundRobin
        );

        ExternalService service = new ExternalService("MultiEndpointAPI", failureRate: 0.1);

        Console.WriteLine("Sending requests across multiple endpoints...\n");

        for (int i = 0; i < 6; i++)
        {
            try
            {
                string result = await ambassador.ExecuteAsync(
                    async (url) => await service.GetDataAsync($"{url}/api/resource/{i}"),
                    $"GetResource{i}"
                );

                Console.WriteLine($"Request {i + 1} succeeded\n");
            }
            catch
            {
                Console.WriteLine($"Request {i + 1} failed\n");
            }
        }

        Console.WriteLine("Endpoint distribution:");
        foreach (EndpointStatus status in ambassador.GetEndpointStatus())
        {
            Console.WriteLine($"  {status}");
        }
    }

    /// <summary>
    /// Scenario 6: Failover scenario with recovery
    /// </summary>
    private static async Task RunScenario6_FailoverScenario()
    {
        Console.WriteLine("\n--- Scenario 6: Failover Scenario ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("Primary", "https://primary.example.com"),
            new ServiceEndpoint("Backup", "https://backup.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(
            endpoints,
            LoadBalancingStrategy.RoundRobin,
            maxRetries: 2
        );

        ExternalService primaryService = new ExternalService("PrimaryAPI", failureRate: 0.8);
        ExternalService backupService = new ExternalService("BackupAPI", failureRate: 0.1);

        Console.WriteLine("Simulating primary server failures with backup failover...\n");

        for (int i = 0; i < 4; i++)
        {
            try
            {
                // Simulate using different services based on endpoint
                string result = await ambassador.ExecuteAsync(
                    async (url) =>
                    {
                        if (url.Contains("primary"))
                        {
                            return await primaryService.GetDataAsync(url);
                        }
                        else
                        {
                            return await backupService.GetDataAsync(url);
                        }
                    },
                    $"FailoverRequest{i + 1}"
                );

                Console.WriteLine($"Request {i + 1} completed successfully\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request {i + 1} failed: {ex.Message}\n");
            }
        }

        Console.WriteLine("Final endpoint status:");
        foreach (EndpointStatus status in ambassador.GetEndpointStatus())
        {
            Console.WriteLine($"  {status}");
        }
    }

    /// <summary>
    /// Scenario 7: Performance metrics collection
    /// </summary>
    private static async Task RunScenario7_PerformanceMetrics()
    {
        Console.WriteLine("\n--- Scenario 7: Performance Metrics ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("MetricsServer", "https://metrics.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(endpoints);
        AmbassadorMetrics metrics = new AmbassadorMetrics();
        ExternalService service = new ExternalService("MetricsAPI", failureRate: 0.3);

        Console.WriteLine("Collecting performance metrics...\n");

        for (int i = 0; i < 10; i++)
        {
            DateTime startTime = DateTime.UtcNow;
            bool success = false;

            try
            {
                await ambassador.ExecuteAsync(
                    async (url) => await service.GetDataAsync($"{url}/api/metrics"),
                    $"MetricsRequest{i + 1}"
                );
                success = true;
            }
            catch
            {
                // Record failure
            }

            TimeSpan responseTime = DateTime.UtcNow - startTime;
            metrics.RecordRequest(success, responseTime);
        }

        Console.WriteLine("\nPerformance Summary:");
        MetricsSnapshot snapshot = metrics.GetSnapshot();
        Console.WriteLine($"  {snapshot}");
    }

    /// <summary>
    /// Scenario 8: Client application using Ambassador
    /// </summary>
    private static async Task RunScenario8_ClientApplication()
    {
        Console.WriteLine("\n--- Scenario 8: Client Application ---");

        List<ServiceEndpoint> endpoints = new List<ServiceEndpoint>
        {
            new ServiceEndpoint("AppServer1", "https://app1.example.com"),
            new ServiceEndpoint("AppServer2", "https://app2.example.com")
        };

        ServiceAmbassador ambassador = new ServiceAmbassador(
            endpoints,
            LoadBalancingStrategy.LeastConnections
        );

        ClientApplication client = new ClientApplication(ambassador);

        Console.WriteLine("Client application making requests through Ambassador...\n");

        try
        {
            // Fetch data
            string userData = await client.FetchDataAsync("user123");
            Console.WriteLine($"Fetched: {userData}");

            // Process data
            int processedValue = await client.ProcessDataAsync(42);
            Console.WriteLine($"Processed: {processedValue}");

            // Another fetch
            string orderData = await client.FetchDataAsync("order456");
            Console.WriteLine($"Fetched: {orderData}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Client error: {ex.Message}");
        }

        Console.WriteLine("\nAmbassador endpoint status:");
        foreach (EndpointStatus status in ambassador.GetEndpointStatus())
        {
            Console.WriteLine($"  {status}");
        }
    }
}
