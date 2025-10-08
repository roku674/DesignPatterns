package Cloud.BackpressurePattern;

/**
 * BackpressurePattern Pattern Demonstration
 *
 * Handles situations when system is overloaded
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== BackpressurePattern Pattern Demo ===\n");

        // Create implementation
        BackpressurePatternImpl implementation = new BackpressurePatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
