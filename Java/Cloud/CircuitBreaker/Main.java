package Cloud.CircuitBreaker;

import java.time.Duration;

/**
 * Demonstrates the Circuit Breaker Pattern.
 * Protects application from repeatedly calling a failing service.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Circuit Breaker Pattern Demo ===\n");

        // Create circuit breaker: 3 failures threshold, 5 seconds timeout
        CircuitBreakerImpl circuitBreaker = new CircuitBreakerImpl(3, Duration.ofSeconds(5));

        // Create unreliable service (70% failure rate)
        UnreliableService service = new UnreliableService(0.7);

        // Make multiple calls
        for (int i = 1; i <= 15; i++) {
            System.out.println("\nAttempt " + i + ":");
            try {
                String result = circuitBreaker.execute(() -> service.call());
                System.out.println("✓ Call succeeded: " + result);
                System.out.println("  State: " + circuitBreaker.getState() +
                        ", Failures: " + circuitBreaker.getFailureCount() +
                        ", Successes: " + circuitBreaker.getSuccessCount());
            } catch (CircuitBreakerException e) {
                System.out.println("✗ Call failed: " + e.getMessage());
                System.out.println("  State: " + circuitBreaker.getState() +
                        ", Failures: " + circuitBreaker.getFailureCount());

                if (circuitBreaker.getState() == CircuitBreakerState.OPEN) {
                    System.out.println("  → Circuit is OPEN, waiting before retry...");
                    try {
                        Thread.sleep(2000); // Wait 2 seconds
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }

        System.out.println("\n--- Summary ---");
        System.out.println("Final state: " + circuitBreaker.getState());
        System.out.println("Total successes: " + circuitBreaker.getSuccessCount());
        System.out.println("\nCircuit Breaker prevented unnecessary calls to failing service!");
    }
}
