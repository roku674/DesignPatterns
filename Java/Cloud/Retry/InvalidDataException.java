package Cloud.Retry;

/**
 * Represents a permanent failure that should not be retried.
 */
public class InvalidDataException extends Exception {
    public InvalidDataException(String message) {
        super(message);
    }
}
