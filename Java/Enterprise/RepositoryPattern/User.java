package Enterprise.RepositoryPattern;

/**
 * Domain entity - User.
 */
public class User {
    private Long id;
    private String username;
    private String email;
    private boolean active;

    public User(String username, String email) {
        this.username = username;
        this.email = email;
        this.active = true;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @Override
    public String toString() {
        return String.format("User{id=%d, username='%s', email='%s', active=%s}",
                id, username, email, active);
    }
}
