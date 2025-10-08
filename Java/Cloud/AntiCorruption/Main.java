package Cloud.AntiCorruption;

/**
 * AntiCorruption Pattern Demonstration
 *
 * Implements a façade between new and legacy applications
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== AntiCorruption Pattern Demo ===\n");

        // Create implementation
        AntiCorruptionImpl implementation = new AntiCorruptionImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
