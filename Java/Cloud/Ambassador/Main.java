package Cloud.Ambassador;

/**
 * Ambassador Pattern Demonstration
 *
 * Creates helper services that send network requests on behalf of consumers
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Ambassador Pattern Demo ===\n");

        // Create implementation
        AmbassadorImpl implementation = new AmbassadorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
