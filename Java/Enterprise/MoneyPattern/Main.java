package Enterprise.MoneyPattern;

/**
 * MoneyPattern Pattern Demonstration
 *
 * Represents monetary values with currency
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MoneyPattern Pattern Demo ===\n");

        // Create implementation
        MoneyPatternImpl implementation = new MoneyPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
