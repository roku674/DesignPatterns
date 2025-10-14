package Enterprise.UnitOfWork;

/**
 * Exception thrown when concurrent modification is detected.
 */
public class ConcurrentModificationException extends RuntimeException {
    public ConcurrentModificationException(String message) {
        super(message);
    }
}
