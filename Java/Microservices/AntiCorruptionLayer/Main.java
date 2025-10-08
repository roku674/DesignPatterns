package Microservices.AntiCorruptionLayer;

/**
 * AntiCorruptionLayer Pattern Demonstration
 *
 * Isolates different subsystems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== AntiCorruptionLayer Pattern Demo ===\n");

        // Create implementation
        AntiCorruptionLayerImpl implementation = new AntiCorruptionLayerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
