package Enterprise.SpecialCase;

/**
 * SpecialCase Pattern Demonstration
 *
 * A subclass that provides special behavior for particular cases
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SpecialCase Pattern Demo ===\n");

        // Create implementation
        SpecialCaseImpl implementation = new SpecialCaseImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
