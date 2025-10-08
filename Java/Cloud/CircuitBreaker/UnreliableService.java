package Cloud.CircuitBreaker;

import java.util.Random;

/**
 * Simulates an unreliable external service for demonstration.
 */
public class UnreliableService {
    private final Random random = new Random();
    private final double failureRate;

    public UnreliableService(double failureRate) {
        this.failureRate = failureRate;
    }

    /**
     * Simulates a service call that may fail.
     */
    public String call() {
        if (random.nextDouble() < failureRate) {
            throw new RuntimeException("Service temporarily unavailable");
        }
        return "Success";
    }
}
