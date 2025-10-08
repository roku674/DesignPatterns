package Enterprise.DataMapper;

/**
 * DataMapper Pattern Demonstration
 *
 * Maps between objects and database tables independently
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DataMapper Pattern Demo ===\n");

        // Create implementation
        DataMapperImpl implementation = new DataMapperImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
