package Cloud.ExternalConfigurationStore;

/**
 * ExternalConfigurationStore Pattern Demonstration
 *
 * Moves configuration from deployment package to centralized location
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ExternalConfigurationStore Pattern Demo ===\n");

        // Create implementation
        ExternalConfigurationStoreImpl implementation = new ExternalConfigurationStoreImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
