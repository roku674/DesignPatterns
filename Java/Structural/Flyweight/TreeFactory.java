import java.util.HashMap;
import java.util.Map;

/**
 * Flyweight Factory - manages the connection pool
 * Ensures only one connection pool exists per unique database configuration
 */
public class TreeFactory {
    private static Map<String, TreeType> treeTypes = new HashMap<>();
    private static int totalRequests = 0;
    private static int cacheHits = 0;

    /**
     * Get or create a connection pool for the specified database
     */
    public static TreeType getTreeType(String host, int port, String database) {
        String key = host + ":" + port + "/" + database;
        totalRequests++;

        TreeType type = treeTypes.get(key);

        if (type == null) {
            // Create new connection pool (expensive operation)
            type = new TreeType(host, port, database);
            treeTypes.put(key, type);
            System.out.println("TreeFactory: Created new connection pool. Total pools: " + treeTypes.size());
        } else {
            cacheHits++;
            System.out.println("TreeFactory: Reusing existing connection pool for " + key);
        }

        return type;
    }

    /**
     * Get the number of unique connection pools
     */
    public static int getTreeTypeCount() {
        return treeTypes.size();
    }

    /**
     * Get memory savings statistics
     */
    public static void printStatistics() {
        System.out.println("\n=== Flyweight Pattern Statistics ===");
        System.out.println("Total connection requests: " + totalRequests);
        System.out.println("Unique connection pools created: " + treeTypes.size());
        System.out.println("Cache hits (reused connections): " + cacheHits);
        System.out.println("Cache hit ratio: " + (cacheHits * 100.0 / totalRequests) + "%");
        System.out.println("Memory saved: " + (totalRequests - treeTypes.size()) + " connection objects");
    }

    /**
     * Clear all cached connection pools
     */
    public static void clear() {
        treeTypes.clear();
        totalRequests = 0;
        cacheHits = 0;
    }

    /**
     * Get all connection pools
     */
    public static Map<String, TreeType> getAllPools() {
        return new HashMap<>(treeTypes);
    }
}
