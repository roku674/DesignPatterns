package Integration.Normalizer;

/**
 * Normalizer Pattern Demonstration
 *
 * Routes messages through translator to common format
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Normalizer Pattern Demo ===\n");

        // Create implementation
        NormalizerImpl implementation = new NormalizerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
