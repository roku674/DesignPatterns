import java.util.*;

/**
 * Subsystem class - Database Connection Manager
 */
public class CPU {
    private Map<String, List<Map<String, Object>>> database = new HashMap<>();
    private boolean connected = false;

    public void freeze() {
        System.out.println("DatabaseConnection: Establishing connection...");
        connected = true;
        initializeData();
    }

    public void jump(long position) {
        if (!connected) {
            System.out.println("DatabaseConnection: Not connected!");
            return;
        }
        System.out.println("DatabaseConnection: Preparing query at position " + position);
    }

    public List<Map<String, Object>> execute(String table) {
        if (!connected) {
            System.out.println("DatabaseConnection: Not connected!");
            return new ArrayList<>();
        }
        System.out.println("DatabaseConnection: Executing query on table: " + table);
        return database.getOrDefault(table, new ArrayList<>());
    }

    public void disconnect() {
        System.out.println("DatabaseConnection: Closing connection");
        connected = false;
    }

    private void initializeData() {
        // Initialize sample data
        List<Map<String, Object>> users = new ArrayList<>();
        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "Alice");
        user1.put("email", "alice@example.com");
        users.add(user1);

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "Bob");
        user2.put("email", "bob@example.com");
        users.add(user2);

        database.put("users", users);
    }

    public boolean isConnected() {
        return connected;
    }
}
