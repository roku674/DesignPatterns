package Cloud.Retry;

import java.time.Duration;

/**
 * Exponential backoff strategy.
 * Increases delay exponentially with each retry attempt.
 *
 * Formula: initialDelay * (multiplier ^ (attempt - 1))
 */
public class ExponentialBackoffStrategy implements BackoffStrategy {
    private final Duration initialDelay;
    private final double multiplier;

    public ExponentialBackoffStrategy(Duration initialDelay, double multiplier) {
        this.initialDelay = initialDelay;
        this.multiplier = multiplier;
    }

    @Override
    public Duration calculateDelay(int attempt) {
        long baseDelayMillis = initialDelay.toMillis();
        long delayMillis = (long) (baseDelayMillis * Math.pow(multiplier, attempt - 1));
        return Duration.ofMillis(delayMillis);
    }
}
