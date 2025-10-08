package Enterprise.ValueHolder;

/**
 * ValueHolder Pattern Demonstration
 *
 * Wraps a value that may need lazy loading
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ValueHolder Pattern Demo ===\n");

        // Create implementation
        ValueHolderImpl implementation = new ValueHolderImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
