package Cloud.Choreography;

/**
 * Choreography Pattern Demonstration
 *
 * Lets each service decide when and how to react to events
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Choreography Pattern Demo ===\n");

        // Create implementation
        ChoreographyImpl implementation = new ChoreographyImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
