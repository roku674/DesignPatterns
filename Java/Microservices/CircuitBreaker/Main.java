package Microservices.CircuitBreaker;

/**
 * Circuit Breaker Pattern Demonstration
 *
 * Prevents cascading failures by failing fast when a service is unavailable.
 * Acts like an electrical circuit breaker that trips when too many failures occur.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests fail immediately
 * - HALF_OPEN: Testing if service recovered
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Circuit Breaker Pattern Demo ===\n");

        // Scenario 1: Normal operation (CLOSED state)
        demonstrateClosedState();

        // Scenario 2: Service failures trip circuit (OPEN state)
        demonstrateOpenState();

        // Scenario 3: Recovery attempt (HALF_OPEN state)
        demonstrateHalfOpenState();

        // Scenario 4: Multiple services with circuit breakers
        demonstrateMultipleServices();

        // Scenario 5: Circuit breaker with fallback
        demonstrateFallbackStrategy();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    private static void demonstrateClosedState() {
        System.out.println("1. Circuit Breaker - CLOSED State (Normal Operation)");
        System.out.println("-".repeat(60));

        UnstableService service = new UnstableService(0.1); // 10% failure rate
        CircuitBreaker breaker = new CircuitBreaker(service, 3, 5000);

        for (int i = 0; i < 5; i++) {
            String result = breaker.call("Request-" + i);
            System.out.println("  " + result);
        }

        System.out.println("Circuit state: " + breaker.getState());
        System.out.println();
    }

    private static void demonstrateOpenState() {
        System.out.println("2. Circuit Breaker - Tripping to OPEN State");
        System.out.println("-".repeat(60));

        UnstableService service = new UnstableService(1.0); // 100% failure rate
        CircuitBreaker breaker = new CircuitBreaker(service, 3, 3000);

        for (int i = 0; i < 6; i++) {
            String result = breaker.call("Request-" + i);
            System.out.println("  " + result);
        }

        System.out.println("Circuit state: " + breaker.getState());
        System.out.println("Circuit is protecting system from cascading failures!");
        System.out.println();
    }

    private static void demonstrateHalfOpenState() {
        System.out.println("3. Circuit Breaker - HALF_OPEN State (Recovery)");
        System.out.println("-".repeat(60));

        UnstableService service = new UnstableService(1.0);
        CircuitBreaker breaker = new CircuitBreaker(service, 2, 1000);

        // Trip the circuit
        System.out.println("Tripping circuit with failures...");
        for (int i = 0; i < 3; i++) {
            breaker.call("Fail-" + i);
        }

        System.out.println("Circuit state: " + breaker.getState());

        // Wait for timeout
        System.out.println("Waiting for timeout...");
        try { Thread.sleep(1500); } catch (InterruptedException e) {}

        // Service recovers
        service.setFailureRate(0.0);
        System.out.println("Service recovered, testing with request...");

        String result = breaker.call("Test-Recovery");
        System.out.println("  " + result);
        System.out.println("Circuit state: " + breaker.getState());
        System.out.println();
    }

    private static void demonstrateMultipleServices() {
        System.out.println("4. Multiple Services with Circuit Breakers");
        System.out.println("-".repeat(60));

        UnstableService paymentService = new UnstableService(0.0);
        UnstableService inventoryService = new UnstableService(0.8);
        UnstableService shippingService = new UnstableService(0.0);

        CircuitBreaker paymentBreaker = new CircuitBreaker(paymentService, 3, 5000);
        CircuitBreaker inventoryBreaker = new CircuitBreaker(inventoryService, 3, 5000);
        CircuitBreaker shippingBreaker = new CircuitBreaker(shippingService, 3, 5000);

        System.out.println("Processing order with multiple services...");
        System.out.println("Payment: " + paymentBreaker.call("Charge-$99.99"));
        System.out.println("Inventory: " + inventoryBreaker.call("Reserve-Item-123"));
        System.out.println("Shipping: " + shippingBreaker.call("Schedule-Delivery"));

        System.out.println("\nCircuit States:");
        System.out.println("  Payment: " + paymentBreaker.getState());
        System.out.println("  Inventory: " + inventoryBreaker.getState());
        System.out.println("  Shipping: " + shippingBreaker.getState());
        System.out.println();
    }

    private static void demonstrateFallbackStrategy() {
        System.out.println("5. Circuit Breaker with Fallback Strategy");
        System.out.println("-".repeat(60));

        UnstableService service = new UnstableService(1.0);
        ResilientCircuitBreaker breaker = new ResilientCircuitBreaker(service, 2, 3000);

        for (int i = 0; i < 5; i++) {
            String result = breaker.callWithFallback("Request-" + i);
            System.out.println("  " + result);
        }

        System.out.println();
    }
}
