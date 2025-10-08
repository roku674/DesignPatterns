package Cloud.FanOut;

/**
 * FanOut Pattern Demonstration
 *
 * Distributes work across multiple workers
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FanOut Pattern Demo ===\n");

        // Create implementation
        FanOutImpl implementation = new FanOutImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
