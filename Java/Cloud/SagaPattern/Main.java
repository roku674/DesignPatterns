package Cloud.SagaPattern;

/**
 * SagaPattern Pattern Demonstration
 *
 * Manages distributed transactions
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SagaPattern Pattern Demo ===\n");

        // Create implementation
        SagaPatternImpl implementation = new SagaPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
