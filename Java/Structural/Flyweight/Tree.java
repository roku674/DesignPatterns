import java.util.Map;

/**
 * Context - stores extrinsic state (query and user info)
 * This is the lightweight object that references the flyweight
 */
public class Tree {
    private String query;
    private String username;
    private TreeType type; // Reference to shared flyweight

    public Tree(String query, String username, TreeType type) {
        this.query = query;
        this.username = username;
        this.type = type;
    }

    /**
     * Execute the query using the shared connection pool
     */
    public Map<String, Object> draw() {
        return type.draw(query, username);
    }

    public String getQuery() {
        return query;
    }

    public String getUsername() {
        return username;
    }

    public TreeType getType() {
        return type;
    }
}
