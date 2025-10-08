package Integration.ClaimCheckPattern;

/**
 * ClaimCheckPattern Pattern Demonstration
 *
 * Reduces message size using reference to stored data
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ClaimCheckPattern Pattern Demo ===\n");

        // Create implementation
        ClaimCheckPatternImpl implementation = new ClaimCheckPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
