package Enterprise.RowDataGateway;

/**
 * RowDataGateway Pattern Demonstration
 *
 * An object that acts as a Gateway to a single record
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RowDataGateway Pattern Demo ===\n");

        // Create implementation
        RowDataGatewayImpl implementation = new RowDataGatewayImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
