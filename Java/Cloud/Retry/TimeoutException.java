package Cloud.Retry;

/**
 * Represents a timeout that may succeed on retry.
 */
public class TimeoutException extends Exception {
    public TimeoutException(String message) {
        super(message);
    }
}
