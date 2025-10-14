package Cloud.Retry;

/**
 * Simulates an unreliable service that fails a certain number of times
 * before succeeding.
 */
public class UnreliableService {
    private int failuresRemaining;
    private int callCount = 0;

    public UnreliableService(int initialFailures) {
        this.failuresRemaining = initialFailures;
    }

    public String performOperation() throws TransientException {
        callCount++;

        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new TransientException("Service temporarily unavailable (failures remaining: " + failuresRemaining + ")");
        }

        return "Operation successful after " + callCount + " attempts";
    }
}
