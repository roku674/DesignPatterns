package Integration.DynamicRouter;

/**
 * DynamicRouter Pattern Demonstration
 *
 * Routes messages with dynamically configured rules
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DynamicRouter Pattern Demo ===\n");

        // Create implementation
        DynamicRouterImpl implementation = new DynamicRouterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
