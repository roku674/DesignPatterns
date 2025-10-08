package Enterprise.Mapper;

/**
 * Mapper Pattern Demonstration
 *
 * Separates in-memory objects from database
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Mapper Pattern Demo ===\n");

        // Create implementation
        MapperImpl implementation = new MapperImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
