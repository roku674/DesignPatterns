package Cloud.Retry;

/**
 * Represents a rate limiting error.
 */
public class RateLimitException extends Exception {
    public RateLimitException(String message) {
        super(message);
    }
}
