package Cloud.Retry;

/**
 * Represents a transient failure that may succeed on retry.
 */
public class TransientException extends Exception {
    public TransientException(String message) {
        super(message);
    }

    public TransientException(String message, Throwable cause) {
        super(message, cause);
    }
}
