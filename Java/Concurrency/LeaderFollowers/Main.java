package Concurrency.LeaderFollowers;

/**
 * LeaderFollowers Pattern Demonstration
 *
 * Provides thread pool with single thread processing at a time
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== LeaderFollowers Pattern Demo ===\n");

        // Create implementation
        LeaderFollowersImpl implementation = new LeaderFollowersImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
