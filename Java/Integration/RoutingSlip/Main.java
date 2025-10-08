package Integration.RoutingSlip;

/**
 * RoutingSlip Pattern Demonstration
 *
 * Routes message through dynamic series of steps
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RoutingSlip Pattern Demo ===\n");

        // Create implementation
        RoutingSlipImpl implementation = new RoutingSlipImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
