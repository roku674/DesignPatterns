package Microservices.ClientSideLoadBalancing;

/**
 * ClientSideLoadBalancing Pattern Demonstration
 *
 * Client selects service instance
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ClientSideLoadBalancing Pattern Demo ===\n");

        // Create implementation
        ClientSideLoadBalancingImpl implementation = new ClientSideLoadBalancingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
