package Concurrency.MonitorObject;

/**
 * MonitorObject Pattern Demonstration
 *
 * Synchronizes concurrent method execution with one monitor lock
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MonitorObject Pattern Demo ===\n");

        // Create implementation
        MonitorObjectImpl implementation = new MonitorObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
