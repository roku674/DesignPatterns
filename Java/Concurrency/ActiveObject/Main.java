package Concurrency.ActiveObject;

/**
 * ActiveObject Pattern Demonstration
 *
 * Decouples method execution from invocation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ActiveObject Pattern Demo ===\n");

        // Create implementation
        ActiveObjectImpl implementation = new ActiveObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
