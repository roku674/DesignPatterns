package Enterprise.LazyLoad;

/**
 * LazyLoad Pattern Demonstration
 *
 * Defers object initialization until needed
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== LazyLoad Pattern Demo ===\n");

        // Create implementation
        LazyLoadImpl implementation = new LazyLoadImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
