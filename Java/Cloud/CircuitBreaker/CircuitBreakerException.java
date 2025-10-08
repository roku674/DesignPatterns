package Cloud.CircuitBreaker;

/**
 * Exception thrown when circuit breaker prevents operation execution.
 */
public class CircuitBreakerException extends Exception {
    public CircuitBreakerException(String message) {
        super(message);
    }

    public CircuitBreakerException(String message, Throwable cause) {
        super(message, cause);
    }
}
