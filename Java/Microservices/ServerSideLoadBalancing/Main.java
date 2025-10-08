package Microservices.ServerSideLoadBalancing;

/**
 * ServerSideLoadBalancing Pattern Demonstration
 *
 * Load balancer selects service instance
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServerSideLoadBalancing Pattern Demo ===\n");

        // Create implementation
        ServerSideLoadBalancingImpl implementation = new ServerSideLoadBalancingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
