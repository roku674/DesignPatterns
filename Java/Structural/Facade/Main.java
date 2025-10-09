import java.util.*;

/**
 * Main class to demonstrate Facade pattern with real database operations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Facade Pattern Demo - Database Operations ===\n");

        ComputerFacade facade = new ComputerFacade();

        // Example 1: Get user by ID (first time - database query)
        System.out.println(">>> Example 1: Get User by ID (First Time)");
        Map<String, Object> user1 = facade.getUserById(1);
        if (user1 != null) {
            System.out.println("Result: " + user1);
        }

        // Example 2: Get same user again (cached)
        System.out.println("\n>>> Example 2: Get Same User (Should be Cached)");
        Map<String, Object> user1Again = facade.getUserById(1);
        if (user1Again != null) {
            System.out.println("Result: " + user1Again);
        }

        // Example 3: Get all users (first time)
        System.out.println("\n>>> Example 3: Get All Users (First Time)");
        List<Map<String, Object>> allUsers = facade.getAllUsers();
        System.out.println("Found " + allUsers.size() + " users:");
        for (Map<String, Object> user : allUsers) {
            System.out.println("  - " + user.get("name") + " (" + user.get("email") + ")");
        }

        // Example 4: Get all users again (cached)
        System.out.println("\n>>> Example 4: Get All Users Again (Should be Cached)");
        List<Map<String, Object>> allUsersAgain = facade.getAllUsers();
        System.out.println("Found " + allUsersAgain.size() + " users (from cache)");

        // Example 5: Create new user with validation
        System.out.println("\n>>> Example 5: Create Valid User");
        boolean success1 = facade.createUser("Charlie", "charlie@example.com");
        System.out.println("Creation " + (success1 ? "successful" : "failed"));

        // Example 6: Try to create user with invalid data
        System.out.println("\n>>> Example 6: Create Invalid User (Bad Email)");
        boolean success2 = facade.createUser("David", "invalid-email");
        System.out.println("Creation " + (success2 ? "successful" : "failed"));

        // Example 7: Try to create user with short name
        System.out.println("\n>>> Example 7: Create Invalid User (Short Name)");
        boolean success3 = facade.createUser("D", "d@example.com");
        System.out.println("Creation " + (success3 ? "successful" : "failed"));

        // Example 8: Get user after cache clear
        System.out.println("\n>>> Example 8: Get User After Cache Clear");
        Map<String, Object> user2 = facade.getUserById(2);
        if (user2 != null) {
            System.out.println("Result: " + user2);
        }

        // Show cache statistics
        facade.showCacheStats();

        // Shutdown
        facade.shutdown();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nFacade Pattern Benefits:");
        System.out.println("- Simplified interface to complex subsystems");
        System.out.println("- Hides complexity of database, caching, and validation");
        System.out.println("- Client code doesn't need to know about subsystems");
        System.out.println("- Easy to add new operations without changing clients");
        System.out.println("\nReal-world usage:");
        System.out.println("- ORMs (Hibernate, JPA) - facade over JDBC");
        System.out.println("- API gateways - facade over microservices");
        System.out.println("- Framework libraries - facade over complex APIs");
        System.out.println("- Payment processors - facade over multiple payment methods");
    }
}
