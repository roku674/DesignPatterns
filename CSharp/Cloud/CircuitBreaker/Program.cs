using System;
using System.Threading.Tasks;

namespace Cloud.CircuitBreaker;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Circuit Breaker Pattern Demo ===\n");

        await Scenario1_BasicCircuitBreaker();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario2_CircuitRecovery();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario3_HalfOpenState();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario4_ManualReset();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario5_AdvancedCircuitBreaker();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario6_MultipleCircuitBreakers();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario7_CircuitBreakerWithRetry();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        Scenario8_CircuitBreakerMetrics();

        Console.WriteLine("\n=== All Scenarios Complete ===");
    }

    /// <summary>
    /// Scenario 1: Basic circuit breaker protecting against service failures
    /// </summary>
    private static async Task Scenario1_BasicCircuitBreaker()
    {
        Console.WriteLine("Scenario 1: Basic Circuit Breaker");
        Console.WriteLine("Demonstrating circuit breaker protecting against repeated failures\n");

        CircuitBreaker<string> circuitBreaker = new CircuitBreaker<string>(
            failureThreshold: 3,
            timeoutSeconds: 5,
            resetTimeoutSeconds: 2);

        ExternalService service = new ExternalService(failureRate: 1.0); // Always fails

        // Make calls until circuit breaker opens
        for (int i = 1; i <= 5; i++)
        {
            try
            {
                string result = await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
                Console.WriteLine($"Call {i}: {result}");
            }
            catch (CircuitBreakerOpenException)
            {
                Console.WriteLine($"Call {i}: Circuit breaker is OPEN - request blocked");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Call {i}: Failed - {ex.Message}");
            }

            await Task.Delay(500);
        }

        Console.WriteLine($"\nFinal State: {circuitBreaker.State}");
        Console.WriteLine($"Failure Count: {circuitBreaker.FailureCount}");
    }

    /// <summary>
    /// Scenario 2: Circuit recovery after service becomes healthy
    /// </summary>
    private static async Task Scenario2_CircuitRecovery()
    {
        Console.WriteLine("Scenario 2: Circuit Recovery");
        Console.WriteLine("Demonstrating circuit breaker recovery when service becomes healthy\n");

        CircuitBreaker<string> circuitBreaker = new CircuitBreaker<string>(
            failureThreshold: 2,
            timeoutSeconds: 3,
            resetTimeoutSeconds: 1);

        ExternalService service = new ExternalService(failureRate: 1.0);

        // Fail enough times to open the circuit
        Console.WriteLine("Phase 1: Failing service");
        for (int i = 1; i <= 3; i++)
        {
            try
            {
                await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Call {i}: {ex.GetType().Name}");
            }
        }

        Console.WriteLine($"\nCircuit State: {circuitBreaker.State}");
        Console.WriteLine("\nWaiting for timeout period...");
        await Task.Delay(3500);

        // Service becomes healthy
        Console.WriteLine("\nPhase 2: Service recovered");
        service = new ExternalService(failureRate: 0.0); // Now always succeeds

        // Next call should move to half-open and then closed
        try
        {
            string result = await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"Call succeeded: {result}");
            Console.WriteLine($"Circuit State: {circuitBreaker.State}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Call failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 3: Half-open state behavior
    /// </summary>
    private static async Task Scenario3_HalfOpenState()
    {
        Console.WriteLine("Scenario 3: Half-Open State Testing");
        Console.WriteLine("Demonstrating behavior when circuit moves to half-open state\n");

        CircuitBreaker<string> circuitBreaker = new CircuitBreaker<string>(
            failureThreshold: 2,
            timeoutSeconds: 2,
            resetTimeoutSeconds: 1);

        ExternalService service = new ExternalService(failureRate: 1.0);

        // Open the circuit
        Console.WriteLine("Opening the circuit...");
        for (int i = 0; i < 2; i++)
        {
            try
            {
                await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
            }
            catch { }
        }

        Console.WriteLine($"Circuit State: {circuitBreaker.State}\n");
        Console.WriteLine("Waiting for timeout...");
        await Task.Delay(2500);

        // Try again in half-open state - still failing
        Console.WriteLine("\nTrying in half-open state (service still failing)...");
        try
        {
            await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
        }
        catch (InvalidOperationException)
        {
            Console.WriteLine("Service call failed in half-open state");
        }

        Console.WriteLine($"Circuit State: {circuitBreaker.State}");
    }

    /// <summary>
    /// Scenario 4: Manual circuit breaker reset
    /// </summary>
    private static async Task Scenario4_ManualReset()
    {
        Console.WriteLine("Scenario 4: Manual Reset");
        Console.WriteLine("Demonstrating manual circuit breaker reset\n");

        CircuitBreaker<string> circuitBreaker = new CircuitBreaker<string>(
            failureThreshold: 2,
            timeoutSeconds: 60); // Long timeout

        ExternalService service = new ExternalService(failureRate: 1.0);

        // Open the circuit
        Console.WriteLine("Opening the circuit...");
        for (int i = 0; i < 2; i++)
        {
            try
            {
                await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
            }
            catch { }
        }

        Console.WriteLine($"Circuit State: {circuitBreaker.State}");
        Console.WriteLine("Normally would wait 60 seconds...\n");

        // Manual reset
        Console.WriteLine("Performing manual reset...");
        circuitBreaker.Reset();
        Console.WriteLine($"Circuit State: {circuitBreaker.State}");

        // Service is now healthy
        service = new ExternalService(failureRate: 0.0);

        // Try again immediately
        try
        {
            string result = await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"Call succeeded after reset: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Call failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 5: Advanced circuit breaker with failure rate threshold
    /// </summary>
    private static async Task Scenario5_AdvancedCircuitBreaker()
    {
        Console.WriteLine("Scenario 5: Advanced Circuit Breaker");
        Console.WriteLine("Using percentage-based failure rate threshold\n");

        AdvancedCircuitBreaker<string> circuitBreaker = new AdvancedCircuitBreaker<string>(
            failureThreshold: 50, // 50% failure rate
            samplingDurationSeconds: 10,
            durationOfBreakSeconds: 3,
            minimumThroughput: 5);

        ExternalService service = new ExternalService(failureRate: 0.6); // 60% failure rate

        Console.WriteLine("Making calls with 60% failure rate...");
        int successCount = 0;
        int failureCount = 0;

        for (int i = 1; i <= 10; i++)
        {
            try
            {
                string result = await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
                successCount++;
                Console.WriteLine($"Call {i}: Success");
            }
            catch (CircuitBreakerOpenException)
            {
                Console.WriteLine($"Call {i}: Circuit OPEN - request blocked");
            }
            catch (Exception)
            {
                failureCount++;
                Console.WriteLine($"Call {i}: Failed");
            }

            await Task.Delay(300);
        }

        Console.WriteLine($"\nSuccesses: {successCount}, Failures: {failureCount}");
        Console.WriteLine($"Circuit State: {circuitBreaker.State}");
    }

    /// <summary>
    /// Scenario 6: Multiple circuit breakers for different services
    /// </summary>
    private static async Task Scenario6_MultipleCircuitBreakers()
    {
        Console.WriteLine("Scenario 6: Multiple Circuit Breakers");
        Console.WriteLine("Managing multiple services with separate circuit breakers\n");

        // Different circuit breakers for different services
        CircuitBreaker<string> paymentServiceCB = new CircuitBreaker<string>(
            failureThreshold: 3,
            timeoutSeconds: 5);

        CircuitBreaker<string> inventoryServiceCB = new CircuitBreaker<string>(
            failureThreshold: 5,
            timeoutSeconds: 10);

        ExternalService paymentService = new ExternalService(failureRate: 0.8);
        ExternalService inventoryService = new ExternalService(failureRate: 0.3);

        Console.WriteLine("Calling Payment Service (high failure rate):");
        for (int i = 1; i <= 5; i++)
        {
            try
            {
                await paymentServiceCB.ExecuteAsync(() => paymentService.CallServiceAsync());
                Console.WriteLine($"  Payment call {i}: Success");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  Payment call {i}: {ex.GetType().Name}");
            }
        }

        Console.WriteLine($"\nPayment Service Circuit: {paymentServiceCB.State}\n");

        Console.WriteLine("Calling Inventory Service (low failure rate):");
        for (int i = 1; i <= 5; i++)
        {
            try
            {
                await inventoryServiceCB.ExecuteAsync(() => inventoryService.CallServiceAsync());
                Console.WriteLine($"  Inventory call {i}: Success");
            }
            catch (Exception)
            {
                Console.WriteLine($"  Inventory call {i}: Failed");
            }
        }

        Console.WriteLine($"\nInventory Service Circuit: {inventoryServiceCB.State}");
    }

    /// <summary>
    /// Scenario 7: Circuit breaker combined with retry logic
    /// </summary>
    private static async Task Scenario7_CircuitBreakerWithRetry()
    {
        Console.WriteLine("Scenario 7: Circuit Breaker with Retry");
        Console.WriteLine("Combining circuit breaker with retry mechanism\n");

        CircuitBreaker<string> circuitBreaker = new CircuitBreaker<string>(
            failureThreshold: 3,
            timeoutSeconds: 5);

        ExternalService service = new ExternalService(failureRate: 0.7);

        async Task<string> CallWithRetry(int maxRetries)
        {
            for (int retry = 1; retry <= maxRetries; retry++)
            {
                try
                {
                    return await circuitBreaker.ExecuteAsync(() => service.CallServiceAsync());
                }
                catch (CircuitBreakerOpenException)
                {
                    Console.WriteLine($"  Retry {retry}: Circuit is open, aborting retries");
                    throw;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  Retry {retry}: {ex.Message}");
                    if (retry == maxRetries)
                    {
                        throw;
                    }
                    await Task.Delay(500);
                }
            }
            throw new InvalidOperationException("All retries exhausted");
        }

        // Attempt multiple operations with retry
        for (int i = 1; i <= 3; i++)
        {
            Console.WriteLine($"Operation {i}:");
            try
            {
                string result = await CallWithRetry(maxRetries: 3);
                Console.WriteLine($"  Success: {result}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  Failed: {ex.GetType().Name}");
            }
            Console.WriteLine();
        }

        Console.WriteLine($"Final Circuit State: {circuitBreaker.State}");
    }

    /// <summary>
    /// Scenario 8: Circuit breaker monitoring and metrics
    /// </summary>
    private static void Scenario8_CircuitBreakerMetrics()
    {
        Console.WriteLine("Scenario 8: Circuit Breaker Metrics and Monitoring");
        Console.WriteLine("Tracking circuit breaker health and statistics\n");

        CircuitBreakerMonitor monitor = new CircuitBreakerMonitor();

        monitor.RecordSuccess("PaymentService");
        monitor.RecordSuccess("PaymentService");
        monitor.RecordFailure("PaymentService");
        monitor.RecordSuccess("PaymentService");
        monitor.RecordFailure("PaymentService");
        monitor.RecordFailure("PaymentService");

        monitor.RecordSuccess("InventoryService");
        monitor.RecordSuccess("InventoryService");
        monitor.RecordSuccess("InventoryService");

        Console.WriteLine("Circuit Breaker Health Report:");
        Console.WriteLine(monitor.GetHealthReport());
    }
}

/// <summary>
/// Monitors circuit breaker metrics across multiple services
/// </summary>
public class CircuitBreakerMonitor
{
    private readonly System.Collections.Generic.Dictionary<string, ServiceMetrics> _metrics =
        new System.Collections.Generic.Dictionary<string, ServiceMetrics>();

    public void RecordSuccess(string serviceName)
    {
        GetOrCreateMetrics(serviceName).SuccessCount++;
    }

    public void RecordFailure(string serviceName)
    {
        GetOrCreateMetrics(serviceName).FailureCount++;
    }

    public string GetHealthReport()
    {
        System.Text.StringBuilder report = new System.Text.StringBuilder();

        foreach (System.Collections.Generic.KeyValuePair<string, ServiceMetrics> kvp in _metrics)
        {
            ServiceMetrics metrics = kvp.Value;
            int total = metrics.SuccessCount + metrics.FailureCount;
            double successRate = total > 0 ? (double)metrics.SuccessCount / total * 100 : 0;

            report.AppendLine($"\n{kvp.Key}:");
            report.AppendLine($"  Total Calls: {total}");
            report.AppendLine($"  Successes: {metrics.SuccessCount}");
            report.AppendLine($"  Failures: {metrics.FailureCount}");
            report.AppendLine($"  Success Rate: {successRate:F2}%");
            report.AppendLine($"  Health: {(successRate >= 90 ? "Healthy" : successRate >= 70 ? "Degraded" : "Unhealthy")}");
        }

        return report.ToString();
    }

    private ServiceMetrics GetOrCreateMetrics(string serviceName)
    {
        if (!_metrics.ContainsKey(serviceName))
        {
            _metrics[serviceName] = new ServiceMetrics();
        }
        return _metrics[serviceName];
    }

    private class ServiceMetrics
    {
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
    }
}
