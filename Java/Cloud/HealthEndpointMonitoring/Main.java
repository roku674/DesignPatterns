package Cloud.HealthEndpointMonitoring;

/**
 * HealthEndpointMonitoring Pattern Demonstration
 *
 * Implements health checks in an application
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== HealthEndpointMonitoring Pattern Demo ===\n");

        // Create implementation
        HealthEndpointMonitoringImpl implementation = new HealthEndpointMonitoringImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
