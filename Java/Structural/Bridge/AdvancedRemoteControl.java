import java.util.List;
import java.util.Map;

/**
 * Refined Abstraction - adds transaction and logging support
 */
public class AdvancedRemoteControl extends RemoteControl {
    private boolean loggingEnabled = true;

    public AdvancedRemoteControl(Device device) {
        super(device);
    }

    /**
     * Execute query with automatic logging
     */
    public List<Map<String, Object>> findAllWithLogging(String tableName) throws Exception {
        if (loggingEnabled) {
            System.out.println("AdvancedRemote: [LOG] Querying table: " + tableName);
        }

        long startTime = System.currentTimeMillis();
        List<Map<String, Object>> results = super.findAll(tableName);
        long endTime = System.currentTimeMillis();

        if (loggingEnabled) {
            System.out.println("AdvancedRemote: [LOG] Query completed in " + (endTime - startTime) + "ms, found " + results.size() + " records");
        }

        return results;
    }

    /**
     * Execute batch insert operation
     */
    public int batchInsert(String tableName, List<Map<String, Object>> records) throws Exception {
        if (!device.isConnected()) {
            throw new Exception("Database not connected");
        }

        System.out.println("AdvancedRemote: Starting batch insert of " + records.size() + " records");

        int totalInserted = 0;
        for (Map<String, Object> record : records) {
            totalInserted += device.executeUpdate("INSERT INTO " + tableName + " VALUES (...)");
        }

        System.out.println("AdvancedRemote: Batch insert completed, " + totalInserted + " records inserted");
        return totalInserted;
    }

    /**
     * Optimize database (implementation specific)
     */
    public void optimize() throws Exception {
        System.out.println("AdvancedRemote: Optimizing database for " + device.getDatabaseType());

        if (device.getDatabaseType().equals("SQLite")) {
            device.executeUpdate("VACUUM");
            System.out.println("AdvancedRemote: SQLite VACUUM completed");
        } else if (device.getDatabaseType().equals("MySQL")) {
            device.executeUpdate("OPTIMIZE TABLE users");
            System.out.println("AdvancedRemote: MySQL OPTIMIZE completed");
        }
    }

    public void toggleLogging() {
        loggingEnabled = !loggingEnabled;
        System.out.println("AdvancedRemote: Logging " + (loggingEnabled ? "enabled" : "disabled"));
    }
}
