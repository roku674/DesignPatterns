package Cloud.Retry;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Demonstrates the Retry Pattern for Cloud Applications.
 *
 * The Retry pattern enables applications to handle transient failures by transparently
 * retrying failed operations. This is essential in cloud environments where temporary
 * issues like network glitches, timeouts, or service unavailability are common.
 *
 * Key Concepts:
 * - Exponential backoff to avoid overwhelming services
 * - Jitter to prevent thundering herd
 * - Max retry attempts to prevent infinite loops
 * - Idempotency considerations
 *
 * Use Cases:
 * - API calls to external services
 * - Database connection attempts
 * - Message queue operations
 * - Cloud storage operations
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Retry Pattern Demo ===\n");

        demonstrateBasicRetry();
        demonstrateExponentialBackoff();
        demonstrateRetryWithJitter();
        demonstrateAsyncRetry();
        demonstrateCustomRetryPolicy();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Retry Pattern Complete ===");
    }

    /**
     * Demonstrates basic retry with fixed delay.
     */
    private static void demonstrateBasicRetry() {
        System.out.println("\n--- Basic Retry Demo ---");

        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(3)
                .fixedDelay(Duration.ofMillis(500))
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);

        // Simulate service that fails twice then succeeds
        UnreliableService service = new UnreliableService(2);

        try {
            String result = executor.execute(() -> service.performOperation());
            System.out.println("Success: " + result);
        } catch (Exception e) {
            System.out.println("Failed after retries: " + e.getMessage());
        }
    }

    /**
     * Demonstrates exponential backoff retry strategy.
     */
    private static void demonstrateExponentialBackoff() {
        System.out.println("\n--- Exponential Backoff Demo ---");

        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(5)
                .exponentialBackoff(Duration.ofMillis(100), 2.0)
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);

        // Simulate service with high failure rate
        UnreliableService service = new UnreliableService(3);

        try {
            String result = executor.execute(() -> service.performOperation());
            System.out.println("Success with exponential backoff: " + result);
        } catch (Exception e) {
            System.out.println("Failed: " + e.getMessage());
        }
    }

    /**
     * Demonstrates retry with jitter to prevent thundering herd.
     */
    private static void demonstrateRetryWithJitter() {
        System.out.println("\n--- Retry with Jitter Demo ---");

        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(4)
                .exponentialBackoff(Duration.ofMillis(100), 2.0)
                .jitter(0.3) // 30% jitter
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);

        // Simulate multiple concurrent requests
        for (int i = 1; i <= 3; i++) {
            int requestId = i;
            new Thread(() -> {
                UnreliableService service = new UnreliableService(2);
                try {
                    String result = executor.execute(() -> service.performOperation());
                    System.out.println("Request " + requestId + " succeeded: " + result);
                } catch (Exception e) {
                    System.out.println("Request " + requestId + " failed: " + e.getMessage());
                }
            }).start();
        }

        sleep(3000);
    }

    /**
     * Demonstrates async retry using CompletableFuture.
     */
    private static void demonstrateAsyncRetry() {
        System.out.println("\n--- Async Retry Demo ---");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(3)
                .exponentialBackoff(Duration.ofMillis(200), 2.0)
                .retryableExceptions(TransientException.class)
                .build();

        AsyncRetryExecutor asyncExecutor = new AsyncRetryExecutor(policy, executor);

        // Execute multiple async operations with retry
        CompletableFuture<String> future1 = asyncExecutor.executeAsync(() -> {
            UnreliableService service = new UnreliableService(1);
            return service.performOperation();
        });

        CompletableFuture<String> future2 = asyncExecutor.executeAsync(() -> {
            UnreliableService service = new UnreliableService(2);
            return service.performOperation();
        });

        CompletableFuture<String> future3 = asyncExecutor.executeAsync(() -> {
            UnreliableService service = new UnreliableService(1);
            return service.performOperation();
        });

        CompletableFuture.allOf(future1, future2, future3)
                .thenRun(() -> {
                    System.out.println("All async operations completed:");
                    try {
                        System.out.println("  Result 1: " + future1.get());
                        System.out.println("  Result 2: " + future2.get());
                        System.out.println("  Result 3: " + future3.get());
                    } catch (Exception e) {
                        System.out.println("  Error: " + e.getMessage());
                    }
                })
                .join();

        executor.shutdown();
    }

    /**
     * Demonstrates custom retry policies for different scenarios.
     */
    private static void demonstrateCustomRetryPolicy() {
        System.out.println("\n--- Custom Retry Policy Demo ---");

        // Policy for database operations
        RetryPolicy dbPolicy = RetryPolicy.builder()
                .maxAttempts(5)
                .exponentialBackoff(Duration.ofMillis(100), 2.0)
                .maxDelay(Duration.ofSeconds(5))
                .retryableExceptions(TransientException.class, TimeoutException.class)
                .nonRetryableExceptions(InvalidDataException.class)
                .build();

        System.out.println("Database retry policy:");
        System.out.println("  Max attempts: 5");
        System.out.println("  Backoff: exponential with 100ms base");
        System.out.println("  Max delay: 5 seconds");

        // Policy for API calls
        RetryPolicy apiPolicy = RetryPolicy.builder()
                .maxAttempts(3)
                .fixedDelay(Duration.ofSeconds(1))
                .retryableExceptions(TransientException.class)
                .retryCondition((attempt, exception) -> {
                    // Custom logic: retry only if it's not a rate limit error
                    return !(exception instanceof RateLimitException);
                })
                .build();

        System.out.println("\nAPI retry policy:");
        System.out.println("  Max attempts: 3");
        System.out.println("  Backoff: fixed 1 second");
        System.out.println("  Custom condition: skip retry on rate limit");
    }

    /**
     * Demonstrates real-world cloud scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        // Scenario 1: AWS S3 upload with retry
        System.out.println("\n1. AWS S3 Upload Simulation:");
        simulateS3Upload();

        // Scenario 2: Azure Service Bus message with retry
        System.out.println("\n2. Azure Service Bus Simulation:");
        simulateServiceBusMessage();

        // Scenario 3: GCP Pub/Sub with retry
        System.out.println("\n3. GCP Pub/Sub Simulation:");
        simulatePubSubPublish();

        // Scenario 4: Database connection with retry
        System.out.println("\n4. Database Connection Simulation:");
        simulateDatabaseConnection();

        // Scenario 5: Microservice API call with retry
        System.out.println("\n5. Microservice API Call Simulation:");
        simulateMicroserviceCall();
    }

    private static void simulateS3Upload() {
        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(3)
                .exponentialBackoff(Duration.ofMillis(100), 2.0)
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);
        CloudService s3 = new CloudService("S3", "us-east-1", 1);

        try {
            String result = executor.execute(() -> s3.upload("file.txt", "content"));
            System.out.println("   " + result);
        } catch (Exception e) {
            System.out.println("   Upload failed: " + e.getMessage());
        }
    }

    private static void simulateServiceBusMessage() {
        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(5)
                .exponentialBackoff(Duration.ofMillis(50), 2.0)
                .jitter(0.2)
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);
        CloudService serviceBus = new CloudService("ServiceBus", "eastus", 2);

        try {
            String result = executor.execute(() -> serviceBus.sendMessage("order-queue", "order-123"));
            System.out.println("   " + result);
        } catch (Exception e) {
            System.out.println("   Send failed: " + e.getMessage());
        }
    }

    private static void simulatePubSubPublish() {
        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(4)
                .exponentialBackoff(Duration.ofMillis(100), 1.5)
                .retryableExceptions(TransientException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);
        CloudService pubsub = new CloudService("PubSub", "us-central1", 1);

        try {
            String result = executor.execute(() -> pubsub.publish("events-topic", "event-data"));
            System.out.println("   " + result);
        } catch (Exception e) {
            System.out.println("   Publish failed: " + e.getMessage());
        }
    }

    private static void simulateDatabaseConnection() {
        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(5)
                .exponentialBackoff(Duration.ofMillis(200), 2.0)
                .maxDelay(Duration.ofSeconds(10))
                .retryableExceptions(TransientException.class, TimeoutException.class)
                .build();

        RetryExecutor executor = new RetryExecutor(policy);
        DatabaseService db = new DatabaseService("orders-db", 2);

        try {
            String result = executor.execute(() -> db.connect());
            System.out.println("   " + result);
        } catch (Exception e) {
            System.out.println("   Connection failed: " + e.getMessage());
        }
    }

    private static void simulateMicroserviceCall() {
        RetryPolicy policy = RetryPolicy.builder()
                .maxAttempts(3)
                .exponentialBackoff(Duration.ofMillis(100), 2.0)
                .retryableExceptions(TransientException.class)
                .retryCondition((attempt, exception) -> {
                    // Custom logic: don't retry 4xx errors
                    if (exception instanceof HttpException) {
                        int status = ((HttpException) exception).getStatusCode();
                        return status >= 500; // Only retry server errors
                    }
                    return true;
                })
                .build();

        RetryExecutor executor = new RetryExecutor(policy);
        MicroserviceClient client = new MicroserviceClient("payment-service", 1);

        try {
            String result = executor.execute(() -> client.processPayment("order-456", 99.99));
            System.out.println("   " + result);
        } catch (Exception e) {
            System.out.println("   Payment failed: " + e.getMessage());
        }
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
