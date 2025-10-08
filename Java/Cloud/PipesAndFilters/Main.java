package Cloud.PipesAndFilters;

/**
 * PipesAndFilters Pattern Demonstration
 *
 * Breaks down complex processing into reusable components
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PipesAndFilters Pattern Demo ===\n");

        // Create implementation
        PipesAndFiltersImpl implementation = new PipesAndFiltersImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
