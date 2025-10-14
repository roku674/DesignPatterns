package Microservices.CircuitBreaker;

/**
 * Circuit Breaker with fallback support
 */
public class ResilientCircuitBreaker extends CircuitBreaker {
    public ResilientCircuitBreaker(UnstableService service, int failureThreshold, long timeout) {
        super(service, failureThreshold, timeout);
    }

    public String callWithFallback(String request) {
        String result = call(request);

        if (result.startsWith("CIRCUIT")) {
            return "FALLBACK: Using cached data for " + request;
        }

        return result;
    }
}
