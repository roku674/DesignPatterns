package Cloud.ClaimCheck;

/**
 * ClaimCheck Pattern Demonstration
 *
 * Splits large message into claim check and payload
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ClaimCheck Pattern Demo ===\n");

        // Create implementation
        ClaimCheckImpl implementation = new ClaimCheckImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
