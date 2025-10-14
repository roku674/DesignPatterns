package Cloud.Retry;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.function.BiPredicate;

/**
 * Defines retry behavior and constraints.
 *
 * Supports multiple backoff strategies:
 * - Fixed delay
 * - Exponential backoff
 * - Custom delay calculation
 */
public class RetryPolicy {
    private final int maxAttempts;
    private final BackoffStrategy backoffStrategy;
    private final Set<Class<? extends Exception>> retryableExceptions;
    private final Set<Class<? extends Exception>> nonRetryableExceptions;
    private final BiPredicate<Integer, Exception> retryCondition;
    private final double jitter;
    private final Duration maxDelay;

    private RetryPolicy(Builder builder) {
        this.maxAttempts = builder.maxAttempts;
        this.backoffStrategy = builder.backoffStrategy;
        this.retryableExceptions = builder.retryableExceptions;
        this.nonRetryableExceptions = builder.nonRetryableExceptions;
        this.retryCondition = builder.retryCondition;
        this.jitter = builder.jitter;
        this.maxDelay = builder.maxDelay;
    }

    public static Builder builder() {
        return new Builder();
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public BackoffStrategy getBackoffStrategy() {
        return backoffStrategy;
    }

    public double getJitter() {
        return jitter;
    }

    public Duration getMaxDelay() {
        return maxDelay;
    }

    /**
     * Determines if an exception should trigger a retry.
     */
    public boolean shouldRetry(int attempt, Exception exception) {
        // Check if max attempts reached
        if (attempt >= maxAttempts) {
            return false;
        }

        // Check non-retryable exceptions first
        for (Class<? extends Exception> exceptionClass : nonRetryableExceptions) {
            if (exceptionClass.isInstance(exception)) {
                return false;
            }
        }

        // Check retryable exceptions
        boolean isRetryable = false;
        for (Class<? extends Exception> exceptionClass : retryableExceptions) {
            if (exceptionClass.isInstance(exception)) {
                isRetryable = true;
                break;
            }
        }

        if (!isRetryable) {
            return false;
        }

        // Apply custom retry condition if present
        if (retryCondition != null) {
            return retryCondition.test(attempt, exception);
        }

        return true;
    }

    /**
     * Calculates delay before next retry attempt.
     */
    public Duration calculateDelay(int attempt) {
        Duration baseDelay = backoffStrategy.calculateDelay(attempt);

        // Apply jitter if configured
        if (jitter > 0) {
            double jitterFactor = 1.0 + (Math.random() * jitter * 2 - jitter);
            long jitteredMillis = (long) (baseDelay.toMillis() * jitterFactor);
            baseDelay = Duration.ofMillis(jitteredMillis);
        }

        // Apply max delay cap if configured
        if (maxDelay != null && baseDelay.compareTo(maxDelay) > 0) {
            baseDelay = maxDelay;
        }

        return baseDelay;
    }

    public static class Builder {
        private int maxAttempts = 3;
        private BackoffStrategy backoffStrategy = new FixedBackoffStrategy(Duration.ofSeconds(1));
        private Set<Class<? extends Exception>> retryableExceptions = new HashSet<>();
        private Set<Class<? extends Exception>> nonRetryableExceptions = new HashSet<>();
        private BiPredicate<Integer, Exception> retryCondition = null;
        private double jitter = 0.0;
        private Duration maxDelay = null;

        public Builder maxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
            return this;
        }

        public Builder fixedDelay(Duration delay) {
            this.backoffStrategy = new FixedBackoffStrategy(delay);
            return this;
        }

        public Builder exponentialBackoff(Duration initialDelay, double multiplier) {
            this.backoffStrategy = new ExponentialBackoffStrategy(initialDelay, multiplier);
            return this;
        }

        @SafeVarargs
        public final Builder retryableExceptions(Class<? extends Exception>... exceptions) {
            this.retryableExceptions.addAll(Arrays.asList(exceptions));
            return this;
        }

        @SafeVarargs
        public final Builder nonRetryableExceptions(Class<? extends Exception>... exceptions) {
            this.nonRetryableExceptions.addAll(Arrays.asList(exceptions));
            return this;
        }

        public Builder retryCondition(BiPredicate<Integer, Exception> condition) {
            this.retryCondition = condition;
            return this;
        }

        public Builder jitter(double jitter) {
            if (jitter < 0 || jitter > 1.0) {
                throw new IllegalArgumentException("Jitter must be between 0 and 1");
            }
            this.jitter = jitter;
            return this;
        }

        public Builder maxDelay(Duration maxDelay) {
            this.maxDelay = maxDelay;
            return this;
        }

        public RetryPolicy build() {
            if (retryableExceptions.isEmpty()) {
                retryableExceptions.add(Exception.class);
            }
            return new RetryPolicy(this);
        }
    }
}
