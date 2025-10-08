package Integration.WireTap;

/**
 * WireTap Pattern Demonstration
 *
 * Inspects messages without affecting them
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== WireTap Pattern Demo ===\n");

        // Create implementation
        WireTapImpl implementation = new WireTapImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
