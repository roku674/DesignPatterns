package Enterprise.TransformView;

/**
 * TransformView Pattern Demonstration
 *
 * Transforms domain data into HTML using transformations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TransformView Pattern Demo ===\n");

        // Create implementation
        TransformViewImpl implementation = new TransformViewImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
