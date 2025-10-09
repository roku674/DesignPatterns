import java.util.*;

/**
 * Facade - provides simplified interface to database operations with caching and validation
 */
public class ComputerFacade {
    private CPU cpu; // Database connection
    private Memory memory; // Cache
    private HardDrive hardDrive; // Validator

    public ComputerFacade() {
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hardDrive = new HardDrive();
    }

    /**
     * Simplified method to get user by ID with caching
     */
    public Map<String, Object> getUserById(int id) {
        System.out.println("\n=== Facade: Getting User by ID ===");

        // Validate input
        if (!hardDrive.validateNumericRange(id, 1, 1000)) {
            System.out.println("Facade: Invalid user ID");
            return null;
        }

        // Check cache first
        String cacheKey = "user:" + id;
        @SuppressWarnings("unchecked")
        Map<String, Object> cachedUser = (Map<String, Object>) memory.get(cacheKey);

        if (cachedUser != null) {
            System.out.println("Facade: Returning cached user");
            return cachedUser;
        }

        // Connect to database
        if (!cpu.isConnected()) {
            cpu.freeze();
        }

        // Execute query
        cpu.jump(0);
        List<Map<String, Object>> users = cpu.execute("users");

        // Find user
        Map<String, Object> user = null;
        for (Map<String, Object> u : users) {
            if ((Integer) u.get("id") == id) {
                user = u;
                break;
            }
        }

        // Cache the result
        if (user != null) {
            memory.load(cacheKey, user);
            System.out.println("Facade: User cached for future requests");
        }

        return user;
    }

    /**
     * Simplified method to validate and create user
     */
    public boolean createUser(String name, String email) {
        System.out.println("\n=== Facade: Creating User ===");

        // Validate inputs
        if (!hardDrive.read(name, 2)) {
            System.out.println("Facade: Name too short (min 2 characters)");
            return false;
        }

        if (!hardDrive.validateEmail(email)) {
            System.out.println("Facade: Invalid email format");
            return false;
        }

        // Connect to database
        if (!cpu.isConnected()) {
            cpu.freeze();
        }

        // Create user (simulated)
        System.out.println("Facade: User created successfully");
        System.out.println("Facade: Name: " + name + ", Email: " + email);

        // Invalidate relevant caches
        memory.clear();

        return true;
    }

    /**
     * Simplified method to get all users with caching
     */
    public List<Map<String, Object>> getAllUsers() {
        System.out.println("\n=== Facade: Getting All Users ===");

        // Check cache
        String cacheKey = "all_users";
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cachedUsers =
                (List<Map<String, Object>>) memory.get(cacheKey);

        if (cachedUsers != null) {
            System.out.println("Facade: Returning cached users list");
            return cachedUsers;
        }

        // Connect and query
        if (!cpu.isConnected()) {
            cpu.freeze();
        }

        cpu.jump(0);
        List<Map<String, Object>> users = cpu.execute("users");

        // Cache results
        memory.load(cacheKey, users);
        System.out.println("Facade: Users list cached");

        return users;
    }

    /**
     * Cleanup method
     */
    public void shutdown() {
        System.out.println("\n=== Facade: Shutting Down ===");
        memory.clear();
        cpu.disconnect();
        System.out.println("Facade: Shutdown complete");
    }

    /**
     * Get cache statistics
     */
    public void showCacheStats() {
        System.out.println("\n=== Cache Statistics ===");
        System.out.println("Cached items: " + memory.size());
    }
}
