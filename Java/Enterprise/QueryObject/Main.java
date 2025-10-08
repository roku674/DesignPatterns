package Enterprise.QueryObject;

/**
 * QueryObject Pattern Demonstration
 *
 * An object that represents a database query
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== QueryObject Pattern Demo ===\n");

        // Create implementation
        QueryObjectImpl implementation = new QueryObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
