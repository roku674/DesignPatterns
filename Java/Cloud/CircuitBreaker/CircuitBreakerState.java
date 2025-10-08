package Cloud.CircuitBreaker;

/**
 * States of a Circuit Breaker.
 */
public enum CircuitBreakerState {
    /**
     * Circuit is closed - requests flow normally.
     */
    CLOSED,

    /**
     * Circuit is open - requests fail immediately.
     */
    OPEN,

    /**
     * Circuit is half-open - testing if service recovered.
     */
    HALF_OPEN
}
