package Integration.CompetingConsumersPattern;

/**
 * CompetingConsumersPattern Pattern Demonstration
 *
 * Multiple consumers compete for messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CompetingConsumersPattern Pattern Demo ===\n");

        // Create implementation
        CompetingConsumersPatternImpl implementation = new CompetingConsumersPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
