package Cloud.CompetingConsumers;

/**
 * CompetingConsumers Pattern Demonstration
 *
 * Enables multiple concurrent consumers to process messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CompetingConsumers Pattern Demo ===\n");

        // Create implementation
        CompetingConsumersImpl implementation = new CompetingConsumersImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
