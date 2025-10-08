package Integration.ControlBus;

/**
 * ControlBus Pattern Demonstration
 *
 * Manages messaging system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ControlBus Pattern Demo ===\n");

        // Create implementation
        ControlBusImpl implementation = new ControlBusImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
