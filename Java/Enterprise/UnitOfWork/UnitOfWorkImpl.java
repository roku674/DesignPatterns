package Enterprise.UnitOfWork;

/**
 * UnitOfWork Pattern Implementation
 *
 * Maintains a list of objects affected by a business transaction
 */
public class UnitOfWorkImpl {

    /**
     * Demonstrates the UnitOfWork pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing UnitOfWork pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
