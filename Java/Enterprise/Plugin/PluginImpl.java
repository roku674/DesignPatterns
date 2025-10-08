package Enterprise.Plugin;

/**
 * Plugin Pattern Implementation
 *
 * Links classes during configuration rather than compilation
 */
public class PluginImpl {

    /**
     * Demonstrates the Plugin pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing Plugin pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
