package Integration.TestMessage;

/**
 * TestMessage Pattern Demonstration
 *
 * Tests messaging system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TestMessage Pattern Demo ===\n");

        // Create implementation
        TestMessageImpl implementation = new TestMessageImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
