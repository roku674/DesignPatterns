package Enterprise.Concurrency;

/**
 * Exception thrown when optimistic locking detects a conflict
 */
public class ConcurrentModificationException extends RuntimeException {
    public ConcurrentModificationException(String message) {
        super(message);
    }
}
