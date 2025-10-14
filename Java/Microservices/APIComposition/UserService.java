package Microservices.APIComposition;

/**
 * User Service - Provides user profile information
 */
public class UserService {
    public User getUser(String userId) {
        simulateDelay(100);
        return new User(userId, "Alice Johnson", "alice@example.com", "Premium");
    }
    private void simulateDelay(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

class User {
    private String id, name, email, tier;
    public User(String id, String name, String email, String tier) {
        this.id = id; this.name = name; this.email = email; this.tier = tier;
    }
    public String toString() { return String.format("User{name='%s', tier='%s'}", name, tier); }
}
