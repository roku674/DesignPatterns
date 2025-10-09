import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Client - manages database queries using connection pools
 */
public class Forest {
    private List<Tree> trees = new ArrayList<>();

    /**
     * Execute a query using a connection pool (flyweight pattern)
     */
    public void plantTree(String query, String username, String host, int port, String database) {
        // Get or create connection pool (flyweight)
        TreeType type = TreeFactory.getTreeType(host, port, database);

        // Create lightweight query object
        Tree tree = new Tree(query, username, type);
        trees.add(tree);
    }

    /**
     * Execute all queued queries
     */
    public void draw() {
        System.out.println("\n=== Executing " + trees.size() + " database queries ===");
        for (int i = 0; i < trees.size(); i++) {
            System.out.println("\nQuery " + (i + 1) + ":");
            Map<String, Object> result = trees.get(i).draw();
            System.out.println("  Result: " + result);
        }
    }

    /**
     * Get total number of queries
     */
    public int getTreeCount() {
        return trees.size();
    }

    /**
     * Clear all queries
     */
    public void clear() {
        trees.clear();
    }
}
