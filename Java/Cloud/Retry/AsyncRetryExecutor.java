package Cloud.Retry;

import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Executes async operations with retry logic.
 */
public class AsyncRetryExecutor {
    private final RetryPolicy policy;
    private final ExecutorService executorService;

    public AsyncRetryExecutor(RetryPolicy policy, ExecutorService executorService) {
        this.policy = policy;
        this.executorService = executorService;
    }

    /**
     * Executes an async operation with retry logic.
     *
     * @param operation The operation to execute
     * @return CompletableFuture containing the result
     */
    public <T> CompletableFuture<T> executeAsync(Callable<T> operation) {
        return executeAsyncInternal(operation, 1);
    }

    private <T> CompletableFuture<T> executeAsyncInternal(Callable<T> operation, int attempt) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                System.out.println("  [Async] Attempt " + attempt + "/" + policy.getMaxAttempts() +
                        " (Thread: " + Thread.currentThread().getName() + ")");
                return operation.call();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, executorService).exceptionally(throwable -> {
            Exception exception = (Exception) throwable.getCause();
            System.out.println("  [Async] Failed: " + exception.getMessage());

            if (!policy.shouldRetry(attempt, exception)) {
                System.out.println("  [Async] Not retrying (policy decision)");
                throw new RuntimeException(exception);
            }

            if (attempt < policy.getMaxAttempts()) {
                Duration delay = policy.calculateDelay(attempt);
                System.out.println("  [Async] Retrying in " + delay.toMillis() + "ms...");

                try {
                    TimeUnit.MILLISECONDS.sleep(delay.toMillis());
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(ie);
                }

                return executeAsyncInternal(operation, attempt + 1).join();
            }

            System.out.println("  [Async] All retry attempts exhausted");
            throw new RuntimeException(exception);
        });
    }
}
