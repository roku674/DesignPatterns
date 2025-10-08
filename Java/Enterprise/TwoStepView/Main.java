package Enterprise.TwoStepView;

/**
 * TwoStepView Pattern Demonstration
 *
 * Turns domain data into HTML in two steps
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TwoStepView Pattern Demo ===\n");

        // Create implementation
        TwoStepViewImpl implementation = new TwoStepViewImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
