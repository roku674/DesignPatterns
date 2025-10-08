package Enterprise.Layer;

/**
 * Layer Pattern Demonstration
 *
 * Organizes system into layers with dependencies pointing downward
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Layer Pattern Demo ===\n");

        // Create implementation
        LayerImpl implementation = new LayerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
