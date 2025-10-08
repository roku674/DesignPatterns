package Microservices.ServiceMesh;

/**
 * ServiceMesh Pattern Demonstration
 *
 * Handles service-to-service communication
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceMesh Pattern Demo ===\n");

        // Create implementation
        ServiceMeshImpl implementation = new ServiceMeshImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
