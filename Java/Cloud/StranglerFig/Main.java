package Cloud.StranglerFig;

/**
 * StranglerFig Pattern Demonstration
 *
 * Incrementally migrates legacy system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== StranglerFig Pattern Demo ===\n");

        // Create implementation
        StranglerFigImpl implementation = new StranglerFigImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
