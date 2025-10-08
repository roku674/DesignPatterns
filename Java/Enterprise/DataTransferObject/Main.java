package Enterprise.DataTransferObject;

/**
 * DataTransferObject Pattern Demonstration
 *
 * An object that carries data between processes
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DataTransferObject Pattern Demo ===\n");

        // Create implementation
        DataTransferObjectImpl implementation = new DataTransferObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
