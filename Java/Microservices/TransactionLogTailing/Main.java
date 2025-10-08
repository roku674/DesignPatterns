package Microservices.TransactionLogTailing;

/**
 * TransactionLogTailing Pattern Demonstration
 *
 * Publishes changes by tailing transaction log
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TransactionLogTailing Pattern Demo ===\n");

        // Create implementation
        TransactionLogTailingImpl implementation = new TransactionLogTailingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
