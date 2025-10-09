import java.util.*;

/**
 * Flyweight - stores intrinsic state (database connection configuration)
 * This is the heavyweight object that gets reused
 */
public class TreeType {
    private String host;
    private int port;
    private String database;
    private long creationTime;

    public TreeType(String host, int port, String database) {
        this.host = host;
        this.port = port;
        this.database = database;
        this.creationTime = System.currentTimeMillis();

        // Simulate expensive connection creation
        try {
            Thread.sleep(100); // Simulates connection overhead
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("TreeType: Created NEW connection pool for " + host + ":" + port + "/" + database);
    }

    /**
     * Execute a query using this connection configuration
     */
    public Map<String, Object> draw(String query, String username) {
        System.out.println("TreeType: Executing query on " + host + ":" + port + "/" + database +
                " (user: " + username + ")");

        // Simulate query execution
        Map<String, Object> result = new HashMap<>();
        result.put("connection", host + ":" + port);
        result.put("database", database);
        result.put("query", query);
        result.put("timestamp", System.currentTimeMillis());

        return result;
    }

    /**
     * Get connection age in milliseconds
     */
    public long getAge() {
        return System.currentTimeMillis() - creationTime;
    }

    public String getConnectionInfo() {
        return host + ":" + port + "/" + database;
    }

    @Override
    public String toString() {
        return "Connection[" + host + ":" + port + "/" + database + "]";
    }
}
