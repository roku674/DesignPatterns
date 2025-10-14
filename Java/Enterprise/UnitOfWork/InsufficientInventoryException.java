package Enterprise.UnitOfWork;

/**
 * Exception thrown when inventory is insufficient for an order.
 */
public class InsufficientInventoryException extends Exception {
    public InsufficientInventoryException(String message) {
        super(message);
    }
}
