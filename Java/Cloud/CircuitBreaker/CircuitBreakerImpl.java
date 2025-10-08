package Cloud.CircuitBreaker;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;

/**
 * Circuit Breaker Pattern Implementation.
 *
 * Prevents an application from repeatedly trying to execute an operation
 * that's likely to fail, allowing it to continue without waiting for the fault to be fixed.
 */
public class CircuitBreakerImpl {
    private final int failureThreshold;
    private final Duration timeout;
    private final AtomicInteger failureCount;
    private final AtomicInteger successCount;
    private final AtomicReference<CircuitBreakerState> state;
    private final AtomicReference<Instant> lastFailureTime;

    /**
     * Creates a circuit breaker.
     *
     * @param failureThreshold Number of failures before opening circuit
     * @param timeout Duration to wait before trying again
     */
    public CircuitBreakerImpl(int failureThreshold, Duration timeout) {
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
        this.failureCount = new AtomicInteger(0);
        this.successCount = new AtomicInteger(0);
        this.state = new AtomicReference<>(CircuitBreakerState.CLOSED);
        this.lastFailureTime = new AtomicReference<>();
    }

    /**
     * Executes operation protected by circuit breaker.
     */
    public <T> T execute(Supplier<T> operation) throws CircuitBreakerException {
        CircuitBreakerState currentState = state.get();

        if (currentState == CircuitBreakerState.OPEN) {
            if (shouldAttemptReset()) {
                transitionTo(CircuitBreakerState.HALF_OPEN);
            } else {
                throw new CircuitBreakerException("Circuit breaker is OPEN");
            }
        }

        try {
            T result = operation.get();
            onSuccess();
            return result;
        } catch (Exception e) {
            onFailure();
            throw new CircuitBreakerException("Operation failed", e);
        }
    }

    private void onSuccess() {
        failureCount.set(0);
        successCount.incrementAndGet();

        if (state.get() == CircuitBreakerState.HALF_OPEN) {
            transitionTo(CircuitBreakerState.CLOSED);
        }
    }

    private void onFailure() {
        lastFailureTime.set(Instant.now());
        int failures = failureCount.incrementAndGet();

        if (failures >= failureThreshold) {
            transitionTo(CircuitBreakerState.OPEN);
        }
    }

    private boolean shouldAttemptReset() {
        Instant lastFailure = lastFailureTime.get();
        if (lastFailure == null) {
            return false;
        }
        return Duration.between(lastFailure, Instant.now()).compareTo(timeout) >= 0;
    }

    private void transitionTo(CircuitBreakerState newState) {
        CircuitBreakerState oldState = state.getAndSet(newState);
        System.out.println("Circuit breaker: " + oldState + " -> " + newState);

        if (newState == CircuitBreakerState.CLOSED) {
            failureCount.set(0);
        }
    }

    public CircuitBreakerState getState() {
        return state.get();
    }

    public int getFailureCount() {
        return failureCount.get();
    }

    public int getSuccessCount() {
        return successCount.get();
    }
}
