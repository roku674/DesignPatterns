/**
 * Main class to demonstrate Flyweight pattern with connection pooling
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Flyweight Pattern Demo - Connection Pooling ===\n");

        Forest forest = new Forest();

        // Simulate multiple queries to different databases
        // Same database connections will be reused (flyweight pattern)

        System.out.println("--- Creating multiple database queries ---\n");

        // Multiple queries to the same database (should reuse connection pool)
        forest.plantTree("SELECT * FROM users", "alice", "localhost", 5432, "app_db");
        forest.plantTree("SELECT * FROM orders", "bob", "localhost", 5432, "app_db");
        forest.plantTree("SELECT * FROM products", "alice", "localhost", 5432, "app_db");

        // Queries to a different database (new connection pool)
        forest.plantTree("SELECT * FROM logs", "admin", "localhost", 5432, "analytics_db");
        forest.plantTree("SELECT * FROM metrics", "admin", "localhost", 5432, "analytics_db");

        // Queries to another server (new connection pool)
        forest.plantTree("SELECT * FROM sessions", "user1", "db-server-2", 3306, "sessions_db");

        // More queries to the first database (reuse existing pool)
        forest.plantTree("SELECT * FROM invoices", "charlie", "localhost", 5432, "app_db");
        forest.plantTree("SELECT * FROM payments", "david", "localhost", 5432, "app_db");

        // Execute all queries
        forest.draw();

        // Show statistics
        TreeFactory.printStatistics();

        System.out.println("\n" + "=".repeat(50));
        System.out.println("\nMemory Efficiency:");
        System.out.println("Total queries executed: " + forest.getTreeCount());
        System.out.println("Unique connection pools created: " + TreeFactory.getTreeTypeCount());
        System.out.println("Memory saved: Instead of creating " + forest.getTreeCount() +
                " connections, only " + TreeFactory.getTreeTypeCount() + " were needed!");

        System.out.println("\nFlyweight Pattern Benefits:");
        System.out.println("- Dramatically reduces memory usage");
        System.out.println("- Shares expensive objects (database connections)");
        System.out.println("- Each query is lightweight, referencing shared connection pool");
        System.out.println("- Perfect for scenarios with many similar objects");

        System.out.println("\nReal-world usage:");
        System.out.println("- Database connection pools (JDBC, Hibernate)");
        System.out.println("- String interning in Java");
        System.out.println("- Glyph rendering in text editors");
        System.out.println("- Particle systems in game engines");
        System.out.println("- Object pools for HTTP connections");
    }
}
