package Integration.TransactionalClient;

/**
 * TransactionalClient Pattern Demonstration
 *
 * Controls transactions from client
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TransactionalClient Pattern Demo ===\n");

        // Create implementation
        TransactionalClientImpl implementation = new TransactionalClientImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
