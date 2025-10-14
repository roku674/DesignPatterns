using System;
using System.Threading.Tasks;

namespace Cloud.Retry;

public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== Retry Pattern Demo ===\n");

        await Scenario1_FixedIntervalRetry();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario2_ExponentialBackoff();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario3_ExponentialBackoffWithJitter();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario4_SelectiveRetry();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario5_RetryWithTimeout();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario6_FluentRetryPolicy();
        Console.WriteLine("\n" + new string('=', 80) + "\n");

        await Scenario7_RetryStatistics();

        Console.WriteLine("\n=== All Scenarios Complete ===");
    }

    /// <summary>
    /// Scenario 1: Fixed interval retry
    /// </summary>
    private static async Task Scenario1_FixedIntervalRetry()
    {
        Console.WriteLine("Scenario 1: Fixed Interval Retry");
        Console.WriteLine("Retrying with fixed 500ms intervals\n");

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 3);

        RetryPolicy<string> policy = new RetryPolicy<string>(
            maxRetries: 5,
            strategy: new FixedIntervalRetryStrategy(TimeSpan.FromMilliseconds(500)));

        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"\n{result}");
            Console.WriteLine($"Total attempts: {policy.RetryCount + 1}");
        }
        catch (RetryExhaustedException ex)
        {
            Console.WriteLine($"\nFailed: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 2: Exponential backoff
    /// </summary>
    private static async Task Scenario2_ExponentialBackoff()
    {
        Console.WriteLine("Scenario 2: Exponential Backoff");
        Console.WriteLine("Wait times: 200ms, 400ms, 800ms, 1600ms...\n");

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 4);

        RetryPolicy<string> policy = new RetryPolicy<string>(
            maxRetries: 6,
            strategy: new ExponentialBackoffRetryStrategy(
                initialInterval: TimeSpan.FromMilliseconds(200),
                maxInterval: TimeSpan.FromSeconds(5),
                multiplier: 2.0));

        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"\n{result}");
            Console.WriteLine($"Total attempts: {policy.RetryCount + 1}");
        }
        catch (RetryExhaustedException ex)
        {
            Console.WriteLine($"\nFailed: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 3: Exponential backoff with jitter
    /// </summary>
    private static async Task Scenario3_ExponentialBackoffWithJitter()
    {
        Console.WriteLine("Scenario 3: Exponential Backoff with Jitter");
        Console.WriteLine("Prevents thundering herd problem\n");

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 3);

        RetryPolicy<string> policy = new RetryPolicy<string>(
            maxRetries: 5,
            strategy: new ExponentialBackoffWithJitterRetryStrategy(
                initialInterval: TimeSpan.FromMilliseconds(100),
                maxInterval: TimeSpan.FromSeconds(3)));

        Console.WriteLine("Showing jitter effect - wait times will vary randomly:");

        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"\n{result}");
        }
        catch (RetryExhaustedException ex)
        {
            Console.WriteLine($"\nFailed: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 4: Selective retry based on exception type
    /// </summary>
    private static async Task Scenario4_SelectiveRetry()
    {
        Console.WriteLine("Scenario 4: Selective Retry");
        Console.WriteLine("Only retry specific exception types\n");

        // Retry only InvalidOperationException
        RetryPolicy<string> policy = new RetryPolicy<string>(
            maxRetries: 3,
            strategy: new FixedIntervalRetryStrategy(TimeSpan.FromMilliseconds(300)),
            shouldRetry: ex => ex is InvalidOperationException);

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 2);

        Console.WriteLine("Test 1: InvalidOperationException (will retry)");
        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"Success: {result}\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed: {ex.Message}\n");
        }

        Console.WriteLine("Test 2: ArgumentException (will NOT retry)");
        try
        {
            await policy.ExecuteAsync<string>(() =>
                throw new ArgumentException("This won't be retried"));
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Failed immediately: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 5: Retry with overall timeout
    /// </summary>
    private static async Task Scenario5_RetryWithTimeout()
    {
        Console.WriteLine("Scenario 5: Retry with Timeout");
        Console.WriteLine("Overall operation timeout: 3 seconds\n");

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 10);

        AdvancedRetryPolicy<string> policy = new AdvancedRetryPolicy<string>(
            maxRetries: 10,
            strategy: new ExponentialBackoffRetryStrategy(
                TimeSpan.FromMilliseconds(500),
                TimeSpan.FromSeconds(2)),
            timeout: TimeSpan.FromSeconds(3),
            onRetry: (attempt, ex) =>
            {
                Console.WriteLine($"[{DateTime.UtcNow:HH:mm:ss}] Retry {attempt}: {ex.Message}");
            });

        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"\n{result}");
        }
        catch (TimeoutException ex)
        {
            Console.WriteLine($"\n{ex.Message}");
        }
        catch (RetryExhaustedException ex)
        {
            Console.WriteLine($"\nAll retries exhausted: {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 6: Fluent retry policy builder
    /// </summary>
    private static async Task Scenario6_FluentRetryPolicy()
    {
        Console.WriteLine("Scenario 6: Fluent Retry Policy Builder");
        Console.WriteLine("Building retry policy with fluent API\n");

        TransientFailureService service = new TransientFailureService(failuresBeforeSuccess: 3);

        AdvancedRetryPolicy<string> policy = new RetryPolicyBuilder<string>()
            .WithMaxRetries(5)
            .WithExponentialBackoffAndJitter(
                initialInterval: TimeSpan.FromMilliseconds(100),
                maxInterval: TimeSpan.FromSeconds(2))
            .WithTimeout(TimeSpan.FromSeconds(10))
            .HandleException<InvalidOperationException>()
            .OnRetry((attempt, ex) =>
            {
                Console.WriteLine($"Retry attempt {attempt}: {ex.Message}");
            })
            .Build();

        try
        {
            string result = await policy.ExecuteAsync(() => service.CallServiceAsync());
            Console.WriteLine($"\nSuccess: {result}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\nFailed: {ex.GetType().Name} - {ex.Message}");
        }
    }

    /// <summary>
    /// Scenario 7: Retry statistics tracking
    /// </summary>
    private static async Task Scenario7_RetryStatistics()
    {
        Console.WriteLine("Scenario 7: Retry Statistics");
        Console.WriteLine("Tracking retry patterns across operations\n");

        RetryStatistics stats = new RetryStatistics();

        RetryPolicy<string> policy = new RetryPolicy<string>(
            maxRetries: 5,
            strategy: new ExponentialBackoffRetryStrategy(
                TimeSpan.FromMilliseconds(100),
                TimeSpan.FromSeconds(2)));

        // Simulate multiple operations
        Console.WriteLine("Running multiple operations...\n");

        for (int i = 1; i <= 5; i++)
        {
            TransientFailureService service = new TransientFailureService(
                failuresBeforeSuccess: new Random().Next(0, 4));

            try
            {
                await policy.ExecuteAsync(() => service.CallServiceAsync());
                stats.RecordAttempt($"Operation{i}", success: true, attempts: policy.RetryCount + 1);
                Console.WriteLine($"Operation {i}: Success after {policy.RetryCount + 1} attempts");
            }
            catch (RetryExhaustedException)
            {
                stats.RecordAttempt($"Operation{i}", success: false, attempts: policy.MaxRetries + 1);
                Console.WriteLine($"Operation {i}: Failed after {policy.MaxRetries + 1} attempts");
            }
        }

        Console.WriteLine("\n" + stats.GetReport());
    }
}
