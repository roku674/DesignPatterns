package Cloud.Retry;

import java.time.Duration;

/**
 * Strategy interface for calculating retry delays.
 */
public interface BackoffStrategy {
    /**
     * Calculates the delay before the next retry attempt.
     *
     * @param attempt The current attempt number (starting from 1)
     * @return The duration to wait before retrying
     */
    Duration calculateDelay(int attempt);
}
