package Integration.IdempotentReceiver;

/**
 * IdempotentReceiver Pattern Demonstration
 *
 * Handles duplicate messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== IdempotentReceiver Pattern Demo ===\n");

        // Create implementation
        IdempotentReceiverImpl implementation = new IdempotentReceiverImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
