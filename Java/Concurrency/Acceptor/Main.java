package Concurrency.Acceptor;

/**
 * Acceptor Pattern Demonstration
 *
 * Decouples passive connection establishment from service processing
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Acceptor Pattern Demo ===\n");

        // Create implementation
        AcceptorImpl implementation = new AcceptorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
