package Microservices.CQRSMS;

/**
 * CQRSMS Pattern Demonstration
 *
 * Separates read and write operations in microservices
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CQRSMS Pattern Demo ===\n");

        // Create implementation
        CQRSMSImpl implementation = new CQRSMSImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
