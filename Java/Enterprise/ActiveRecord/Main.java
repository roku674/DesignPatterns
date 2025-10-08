package Enterprise.ActiveRecord;

/**
 * ActiveRecord Pattern Demonstration
 *
 * Wraps a database row with domain logic
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ActiveRecord Pattern Demo ===\n");

        // Create implementation
        ActiveRecordImpl implementation = new ActiveRecordImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
