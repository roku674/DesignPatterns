package Microservices.ServiceDiscovery;

/**
 * ServiceDiscovery Pattern Demonstration
 *
 * Automatically detects service instances
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceDiscovery Pattern Demo ===\n");

        // Create implementation
        ServiceDiscoveryImpl implementation = new ServiceDiscoveryImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
