package Cloud.CacheAside;

/**
 * CacheAside Pattern Demonstration
 *
 * Loads data on demand into cache from data store
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CacheAside Pattern Demo ===\n");

        // Create implementation
        CacheAsideImpl implementation = new CacheAsideImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
