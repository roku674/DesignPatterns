package Microservices.CircuitBreaker;

/**
 * Circuit Breaker implementation
 *
 * Tracks failures and opens circuit when threshold is exceeded.
 */
public class CircuitBreaker {
    private enum State { CLOSED, OPEN, HALF_OPEN }

    private final UnstableService service;
    private final int failureThreshold;
    private final long timeout;

    private State state = State.CLOSED;
    private int failureCount = 0;
    private long lastFailureTime = 0;

    public CircuitBreaker(UnstableService service, int failureThreshold, long timeout) {
        this.service = service;
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
    }

    public String call(String request) {
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - lastFailureTime >= timeout) {
                state = State.HALF_OPEN;
                System.out.println("    [Circuit: HALF_OPEN - Testing recovery]");
            } else {
                return "CIRCUIT OPEN - Request rejected (fast fail)";
            }
        }

        try {
            String response = service.call(request);
            onSuccess();
            return response;
        } catch (Exception e) {
            onFailure();
            return "CIRCUIT BREAKER - " + e.getMessage();
        }
    }

    private void onSuccess() {
        failureCount = 0;
        if (state == State.HALF_OPEN) {
            state = State.CLOSED;
            System.out.println("    [Circuit: Recovered -> CLOSED]");
        }
    }

    private void onFailure() {
        failureCount++;
        lastFailureTime = System.currentTimeMillis();

        if (failureCount >= failureThreshold) {
            if (state != State.OPEN) {
                state = State.OPEN;
                System.out.println("    [Circuit: TRIPPED -> OPEN]");
            }
        }
    }

    public String getState() {
        return state.toString();
    }
}
