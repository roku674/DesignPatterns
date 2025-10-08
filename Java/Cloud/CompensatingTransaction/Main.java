package Cloud.CompensatingTransaction;

/**
 * CompensatingTransaction Pattern Demonstration
 *
 * Undoes work performed by a series of steps
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CompensatingTransaction Pattern Demo ===\n");

        // Create implementation
        CompensatingTransactionImpl implementation = new CompensatingTransactionImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
