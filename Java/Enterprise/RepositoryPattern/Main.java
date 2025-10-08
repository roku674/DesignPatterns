package Enterprise.RepositoryPattern;

import java.util.List;
import java.util.Optional;

/**
 * Demonstrates the Repository Pattern.
 * Repository mediates between domain and data mapping layers using a collection-like interface.
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Repository Pattern Demo ===\n");

        // Create repository (could be swapped with database implementation)
        UserRepository userRepository = new InMemoryUserRepository();

        // Create and save users
        System.out.println("1. Creating users...");
        User alice = new User("alice", "alice@example.com");
        User bob = new User("bob", "bob@example.com");
        User charlie = new User("charlie", "charlie@example.com");

        userRepository.save(alice);
        userRepository.save(bob);
        userRepository.save(charlie);
        System.out.println("Created " + userRepository.count() + " users");

        // Find by ID
        System.out.println("\n2. Finding user by ID...");
        Optional<User> foundUser = userRepository.findById(1L);
        foundUser.ifPresent(user -> System.out.println("Found: " + user));

        // Find by username
        System.out.println("\n3. Finding user by username...");
        Optional<User> bobUser = userRepository.findByUsername("bob");
        bobUser.ifPresent(user -> System.out.println("Found: " + user));

        // Find all users
        System.out.println("\n4. Finding all users...");
        List<User> allUsers = userRepository.findAll();
        allUsers.forEach(System.out::println);

        // Deactivate a user
        System.out.println("\n5. Deactivating charlie...");
        charlie.setActive(false);
        userRepository.save(charlie);

        // Find active users
        System.out.println("\n6. Finding active users...");
        List<User> activeUsers = userRepository.findActiveUsers();
        System.out.println("Active users: " + activeUsers.size());
        activeUsers.forEach(System.out::println);

        // Update user
        System.out.println("\n7. Updating user email...");
        alice.setEmail("alice.updated@example.com");
        userRepository.save(alice);
        userRepository.findById(alice.getId())
                .ifPresent(u -> System.out.println("Updated: " + u));

        // Delete user
        System.out.println("\n8. Deleting user...");
        userRepository.delete(bob);
        System.out.println("Remaining users: " + userRepository.count());

        System.out.println("\nRepository pattern allows easy switching of data sources!");
    }
}
