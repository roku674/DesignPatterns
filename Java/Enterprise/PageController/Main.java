package Enterprise.PageController;

/**
 * PageController Pattern Demonstration
 *
 * Handles a request for a specific page or action
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PageController Pattern Demo ===\n");

        // Create implementation
        PageControllerImpl implementation = new PageControllerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
