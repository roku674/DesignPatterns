import java.util.*;

/**
 * Concrete Implementation - Mock MySQL Database
 */
public class Radio implements Device {
    private boolean connected = false;
    private Map<String, List<Map<String, Object>>> tables;
    private String connectionString;

    public Radio() {
        tables = new HashMap<>();
        connectionString = "mysql://localhost:3306/testdb";
    }

    @Override
    public void connect() throws Exception {
        if (!connected) {
            connected = true;
            System.out.println("MySQL: Connected to " + connectionString);
            initializeSampleData();
        }
    }

    @Override
    public void disconnect() throws Exception {
        if (connected) {
            connected = false;
            System.out.println("MySQL: Connection closed");
        }
    }

    @Override
    public boolean isConnected() {
        return connected;
    }

    @Override
    public List<Map<String, Object>> executeQuery(String query) throws Exception {
        if (!connected) {
            throw new Exception("Not connected to MySQL database");
        }

        String lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.startsWith("select")) {
            String tableName = extractTableName(query);

            if (tables.containsKey(tableName)) {
                System.out.println("MySQL: Executing SELECT query on '" + tableName + "'");
                // Simulate query execution time
                Thread.sleep(10);
                return new ArrayList<>(tables.get(tableName));
            } else {
                throw new Exception("Table '" + tableName + "' does not exist");
            }
        }

        return new ArrayList<>();
    }

    @Override
    public int executeUpdate(String query) throws Exception {
        if (!connected) {
            throw new Exception("Not connected to MySQL database");
        }

        String lowerQuery = query.toLowerCase().trim();

        if (lowerQuery.startsWith("insert")) {
            String tableName = extractTableName(query);
            if (!tables.containsKey(tableName)) {
                tables.put(tableName, new ArrayList<>());
            }

            Map<String, Object> row = new HashMap<>();
            row.put("id", tables.get(tableName).size() + 1);
            row.put("timestamp", new Date());
            tables.get(tableName).add(row);

            System.out.println("MySQL: INSERT completed, 1 row affected");
            return 1;
        } else if (lowerQuery.startsWith("update")) {
            System.out.println("MySQL: UPDATE completed, rows affected");
            return 2;
        } else if (lowerQuery.startsWith("delete")) {
            System.out.println("MySQL: DELETE completed, rows affected");
            return 1;
        }

        return 0;
    }

    @Override
    public String getDatabaseType() {
        return "MySQL";
    }

    private void initializeSampleData() {
        List<Map<String, Object>> products = new ArrayList<>();

        Map<String, Object> product1 = new HashMap<>();
        product1.put("id", 1);
        product1.put("name", "Laptop");
        product1.put("price", 999.99);
        products.add(product1);

        Map<String, Object> product2 = new HashMap<>();
        product2.put("id", 2);
        product2.put("name", "Mouse");
        product2.put("price", 25.50);
        products.add(product2);

        tables.put("products", products);
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
