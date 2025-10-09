import java.util.*;

/**
 * Concrete Implementation - In-Memory Database (simulates SQLite)
 */
public class TV implements Device {
    private boolean connected = false;
    private Map<String, List<Map<String, Object>>> tables;

    public TV() {
        tables = new HashMap<>();
    }

    @Override
    public void connect() throws Exception {
        if (!connected) {
            connected = true;
            System.out.println("SQLite: Connected to in-memory database");
            initializeSampleData();
        }
    }

    @Override
    public void disconnect() throws Exception {
        if (connected) {
            connected = false;
            System.out.println("SQLite: Disconnected from database");
        }
    }

    @Override
    public boolean isConnected() {
        return connected;
    }

    @Override
    public List<Map<String, Object>> executeQuery(String query) throws Exception {
        if (!connected) {
            throw new Exception("Not connected to database");
        }

        String lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.startsWith("select")) {
            // Simple SELECT parsing
            String tableName = extractTableName(query);

            if (tables.containsKey(tableName)) {
                System.out.println("SQLite: Executing query on table '" + tableName + "'");
                return new ArrayList<>(tables.get(tableName));
            } else {
                return new ArrayList<>();
            }
        }

        return new ArrayList<>();
    }

    @Override
    public int executeUpdate(String query) throws Exception {
        if (!connected) {
            throw new Exception("Not connected to database");
        }

        String lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.startsWith("insert")) {
            String tableName = extractTableName(query);
            if (!tables.containsKey(tableName)) {
                tables.put(tableName, new ArrayList<>());
            }

            Map<String, Object> row = new HashMap<>();
            row.put("id", tables.get(tableName).size() + 1);
            row.put("data", "Sample Data");
            tables.get(tableName).add(row);

            System.out.println("SQLite: Inserted 1 row into '" + tableName + "'");
            return 1;
        } else if (lowerQuery.startsWith("update")) {
            System.out.println("SQLite: Updated rows");
            return 1;
        } else if (lowerQuery.startsWith("delete")) {
            System.out.println("SQLite: Deleted rows");
            return 1;
        }

        return 0;
    }

    @Override
    public String getDatabaseType() {
        return "SQLite";
    }

    private void initializeSampleData() {
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

        tables.put("users", users);
    }

    private String extractTableName(String query) {
        String[] parts = query.toLowerCase().split("\\s+");
        for (int i = 0; i < parts.length - 1; i++) {
            if (parts[i].equals("from") || parts[i].equals("into") || parts[i].equals("update")) {
                return parts[i + 1].replaceAll("[^a-zA-Z0-9_]", "");
            }
        }
        return "unknown";
    }
}
