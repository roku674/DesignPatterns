package Cloud.Retry;

import java.time.Duration;
import java.util.concurrent.Callable;

/**
 * Executes operations with retry logic based on a RetryPolicy.
 */
public class RetryExecutor {
    private final RetryPolicy policy;

    public RetryExecutor(RetryPolicy policy) {
        this.policy = policy;
    }

    /**
     * Executes a callable operation with retry logic.
     *
     * @param operation The operation to execute
     * @return The result of the operation
     * @throws Exception if all retry attempts fail
     */
    public <T> T execute(Callable<T> operation) throws Exception {
        int attempt = 0;
        Exception lastException = null;

        while (attempt < policy.getMaxAttempts()) {
            attempt++;

            try {
                System.out.println("  Attempt " + attempt + "/" + policy.getMaxAttempts());
                T result = operation.call();
                if (attempt > 1) {
                    System.out.println("  ✓ Succeeded on attempt " + attempt);
                }
                return result;
            } catch (Exception e) {
                lastException = e;
                System.out.println("  ✗ Failed: " + e.getMessage());

                if (!policy.shouldRetry(attempt, e)) {
                    System.out.println("  → Not retrying (policy decision)");
                    throw e;
                }

                if (attempt < policy.getMaxAttempts()) {
                    Duration delay = policy.calculateDelay(attempt);
                    System.out.println("  → Retrying in " + delay.toMillis() + "ms...");
                    Thread.sleep(delay.toMillis());
                }
            }
        }

        System.out.println("  ✗ All retry attempts exhausted");
        throw lastException;
    }
}
