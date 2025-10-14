package Cloud.Retry;

/**
 * Simulates a microservice client with potential failures.
 */
public class MicroserviceClient {
    private final String serviceName;
    private int failuresRemaining;

    public MicroserviceClient(String serviceName, int initialFailures) {
        this.serviceName = serviceName;
        this.failuresRemaining = initialFailures;
    }

    public String processPayment(String orderId, double amount) throws TransientException {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TransientException(serviceName + " unavailable: 503 Service Temporarily Unavailable");
        }
        return serviceName + " processed payment for order " + orderId + ": $" + amount;
    }
}
