package Enterprise.TableDataGateway;

/**
 * TableDataGateway Pattern Demonstration
 *
 * An object that acts as a Gateway to a database table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TableDataGateway Pattern Demo ===\n");

        // Create implementation
        TableDataGatewayImpl implementation = new TableDataGatewayImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
