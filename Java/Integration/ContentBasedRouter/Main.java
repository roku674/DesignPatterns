package Integration.ContentBasedRouter;

/**
 * ContentBasedRouter Pattern Demonstration
 *
 * Routes messages based on content
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContentBasedRouter Pattern Demo ===\n");

        // Create implementation
        ContentBasedRouterImpl implementation = new ContentBasedRouterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
