import java.util.*;

/**
 * Main class to demonstrate the Bridge pattern with real database operations
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Bridge Pattern Demo - Database Abstraction ===\n");

        try {
            // Test 1: SQLite with basic operations
            System.out.println("--- Testing SQLite with Basic Remote ---");
            Device sqlite = new TV(); // TV represents SQLite
            RemoteControl basicRemote = new RemoteControl(sqlite);

            basicRemote.open();
            List<Map<String, Object>> users = basicRemote.findAll("users");
            System.out.println("Found " + users.size() + " users:");
            for (Map<String, Object> user : users) {
                System.out.println("  - " + user.get("name") + " (" + user.get("email") + ")");
            }
            basicRemote.close();

            // Test 2: MySQL with advanced operations
            System.out.println("\n--- Testing MySQL with Advanced Remote ---");
            Device mysql = new Radio(); // Radio represents MySQL
            AdvancedRemoteControl advancedRemote = new AdvancedRemoteControl(mysql);

            advancedRemote.open();
            System.out.println(advancedRemote.getDatabaseInfo());

            // Query with logging
            List<Map<String, Object>> products = advancedRemote.findAllWithLogging("products");
            System.out.println("Found " + products.size() + " products:");
            for (Map<String, Object> product : products) {
                System.out.println("  - " + product.get("name") + " - $" + product.get("price"));
            }

            // Batch insert
            List<Map<String, Object>> newProducts = new ArrayList<>();
            newProducts.add(new HashMap<>());
            newProducts.add(new HashMap<>());
            advancedRemote.batchInsert("products", newProducts);

            // Optimize
            advancedRemote.optimize();

            advancedRemote.close();

            // Test 3: Switching implementations
            System.out.println("\n--- Demonstrating Bridge Pattern Flexibility ---");
            System.out.println("Using same abstraction with different implementations:\n");

            RemoteControl sqliteControl = new RemoteControl(sqlite);
            RemoteControl mysqlControl = new RemoteControl(mysql);

            sqliteControl.open();
            System.out.println("Connected via: " + sqliteControl.getDatabaseInfo());
            sqliteControl.close();

            mysqlControl.open();
            System.out.println("Connected via: " + mysqlControl.getDatabaseInfo());
            mysqlControl.close();

            System.out.println("\n" + "=".repeat(50));
            System.out.println("\nBridge Pattern Benefits:");
            System.out.println("- Abstractions (RemoteControl) and implementations (Device) vary independently");
            System.out.println("- Can switch between SQLite and MySQL without changing client code");
            System.out.println("- New database types can be added without modifying abstractions");
            System.out.println("- Advanced features can be added to abstraction without affecting implementations");
            System.out.println("\nReal-world usage:");
            System.out.println("- Database drivers (JDBC)");
            System.out.println("- Graphics rendering engines");
            System.out.println("- Message queue implementations (Kafka, RabbitMQ)");
            System.out.println("- Logging frameworks with multiple backends");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
