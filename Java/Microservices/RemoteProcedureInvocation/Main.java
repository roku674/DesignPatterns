package Microservices.RemoteProcedureInvocation;

/**
 * RemoteProcedureInvocation Pattern Demonstration
 *
 * Uses RPC for inter-service communication
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RemoteProcedureInvocation Pattern Demo ===\n");

        // Create implementation
        RemoteProcedureInvocationImpl implementation = new RemoteProcedureInvocationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
