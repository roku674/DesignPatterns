package Integration.ReturnAddress;

/**
 * ReturnAddress Pattern Demonstration
 *
 * Specifies where reply should be sent
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ReturnAddress Pattern Demo ===\n");

        // Create implementation
        ReturnAddressImpl implementation = new ReturnAddressImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
