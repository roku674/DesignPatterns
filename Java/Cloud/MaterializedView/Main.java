package Cloud.MaterializedView;

/**
 * MaterializedView Pattern Demonstration
 *
 * Generates prepopulated views over data
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MaterializedView Pattern Demo ===\n");

        // Create implementation
        MaterializedViewImpl implementation = new MaterializedViewImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
