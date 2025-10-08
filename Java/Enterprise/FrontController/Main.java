package Enterprise.FrontController;

/**
 * FrontController Pattern Demonstration
 *
 * Central controller that handles all requests
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FrontController Pattern Demo ===\n");

        // Create implementation
        FrontControllerImpl implementation = new FrontControllerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
