package Cloud.IndexTable;

/**
 * IndexTable Pattern Demonstration
 *
 * Creates indexes over fields frequently referenced by queries
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== IndexTable Pattern Demo ===\n");

        // Create implementation
        IndexTableImpl implementation = new IndexTableImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
