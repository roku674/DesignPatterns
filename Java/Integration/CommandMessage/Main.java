package Integration.CommandMessage;

/**
 * CommandMessage Pattern Demonstration
 *
 * Sends a command for the receiver to execute
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CommandMessage Pattern Demo ===\n");

        // Create implementation
        CommandMessageImpl implementation = new CommandMessageImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
