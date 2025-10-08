package Integration.ContentFilter;

/**
 * ContentFilter Pattern Demonstration
 *
 * Removes unwanted data items from messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContentFilter Pattern Demo ===\n");

        // Create implementation
        ContentFilterImpl implementation = new ContentFilterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
