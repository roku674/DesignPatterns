package Integration.ServiceActivator;

/**
 * ServiceActivator Pattern Demonstration
 *
 * Invokes service when message arrives
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceActivator Pattern Demo ===\n");

        // Create implementation
        ServiceActivatorImpl implementation = new ServiceActivatorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
