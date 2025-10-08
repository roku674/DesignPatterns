package Enterprise.Plugin;

/**
 * Plugin Pattern Demonstration
 *
 * Links classes during configuration rather than compilation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Plugin Pattern Demo ===\n");

        // Create implementation
        PluginImpl implementation = new PluginImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
