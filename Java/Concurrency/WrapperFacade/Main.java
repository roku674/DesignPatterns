package Concurrency.WrapperFacade;

/**
 * WrapperFacade Pattern Demonstration
 *
 * Encapsulates functions and data provided by non-OO APIs
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== WrapperFacade Pattern Demo ===\n");

        // Create implementation
        WrapperFacadeImpl implementation = new WrapperFacadeImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
