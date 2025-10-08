package Microservices.ServiceRegistry;

/**
 * ServiceRegistry Pattern Demonstration
 *
 * Central registry for service discovery
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceRegistry Pattern Demo ===\n");

        // Create implementation
        ServiceRegistryImpl implementation = new ServiceRegistryImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
