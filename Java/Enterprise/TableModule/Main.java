package Enterprise.TableModule;

/**
 * TableModule Pattern Demonstration
 *
 * Organizes domain logic with one class per database table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TableModule Pattern Demo ===\n");

        // Create implementation
        TableModuleImpl implementation = new TableModuleImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
