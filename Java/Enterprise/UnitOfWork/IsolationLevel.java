package Enterprise.UnitOfWork;

/**
 * Transaction isolation levels for UnitOfWork.
 *
 * @author Enterprise Patterns Implementation
 */
public enum IsolationLevel {
    /**
     * Allows reading only committed data. Prevents dirty reads.
     */
    READ_COMMITTED,

    /**
     * Prevents dirty reads and non-repeatable reads.
     */
    REPEATABLE_READ,

    /**
     * Highest isolation level. Prevents dirty reads, non-repeatable reads,
     * and phantom reads. Transactions appear to execute serially.
     */
    SERIALIZABLE
}
