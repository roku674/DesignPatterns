package Cloud.Retry;

import java.time.Duration;

/**
 * Fixed delay backoff strategy.
 * Always waits the same amount of time between retries.
 */
public class FixedBackoffStrategy implements BackoffStrategy {
    private final Duration delay;

    public FixedBackoffStrategy(Duration delay) {
        this.delay = delay;
    }

    @Override
    public Duration calculateDelay(int attempt) {
        return delay;
    }
}
