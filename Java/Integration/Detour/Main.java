package Integration.Detour;

/**
 * Detour Pattern Demonstration
 *
 * Routes message through intermediate steps
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Detour Pattern Demo ===\n");

        // Create implementation
        DetourImpl implementation = new DetourImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
