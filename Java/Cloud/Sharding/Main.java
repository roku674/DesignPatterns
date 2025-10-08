package Cloud.Sharding;

/**
 * Sharding Pattern Demonstration
 *
 * Divides data store into horizontal partitions
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Sharding Pattern Demo ===\n");

        // Create implementation
        ShardingImpl implementation = new ShardingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
