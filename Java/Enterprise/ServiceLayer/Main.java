package Enterprise.ServiceLayer;

/**
 * ServiceLayer Pattern Demonstration
 *
 * Defines application's boundary with a layer of services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceLayer Pattern Demo ===\n");

        // Create implementation
        ServiceLayerImpl implementation = new ServiceLayerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
