package Enterprise.Separated;

/**
 * Separated Pattern Demonstration
 *
 * Separates domain logic from presentation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Separated Pattern Demo ===\n");

        // Create implementation
        SeparatedImpl implementation = new SeparatedImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
