package Integration.ContentBasedFilter;

/**
 * ContentBasedFilter Pattern Demonstration
 *
 * Filters messages based on content
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContentBasedFilter Pattern Demo ===\n");

        // Create implementation
        ContentBasedFilterImpl implementation = new ContentBasedFilterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
