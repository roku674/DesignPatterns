package Enterprise.UnitOfWork;

/**
 * UnitOfWork Pattern Demonstration
 *
 * Maintains a list of objects affected by a business transaction
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== UnitOfWork Pattern Demo ===\n");

        // Create implementation
        UnitOfWorkImpl implementation = new UnitOfWorkImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
