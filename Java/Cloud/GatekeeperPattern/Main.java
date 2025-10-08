package Cloud.GatekeeperPattern;

/**
 * GatekeeperPattern Pattern Demonstration
 *
 * Protects applications using a dedicated host instance
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GatekeeperPattern Pattern Demo ===\n");

        // Create implementation
        GatekeeperPatternImpl implementation = new GatekeeperPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
