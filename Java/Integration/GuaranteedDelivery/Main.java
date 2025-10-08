package Integration.GuaranteedDelivery;

/**
 * GuaranteedDelivery Pattern Demonstration
 *
 * Ensures message delivery even after crash
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GuaranteedDelivery Pattern Demo ===\n");

        // Create implementation
        GuaranteedDeliveryImpl implementation = new GuaranteedDeliveryImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
