package Concurrency.StrategyPattern;

/**
 * StrategyPattern Pattern Demonstration
 *
 * Enables runtime selection of algorithm
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== StrategyPattern Pattern Demo ===\n");

        // Create implementation
        StrategyPatternImpl implementation = new StrategyPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
