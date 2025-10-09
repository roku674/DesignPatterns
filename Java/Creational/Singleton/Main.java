import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Main class to demonstrate the Singleton pattern with real connection pool
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Singleton Pattern - Real Connection Pool Demo ===\n");

        try {
            // Get the singleton instance
            DatabaseConnection pool = DatabaseConnection.getInstance();
            System.out.println("Connection pool initialized");
            System.out.println("Initial pool size: " + pool.getPoolSize());
            System.out.println("Available connections: " + pool.getAvailableConnections());
            System.out.println();

            // Create a test table
            setupDatabase(pool);

            // Verify both references point to the same instance
            DatabaseConnection pool2 = DatabaseConnection.getInstance();
            System.out.println("Are pool and pool2 the same instance? " + (pool == pool2));
            System.out.println("pool hashCode: " + pool.hashCode());
            System.out.println("pool2 hashCode: " + pool2.hashCode());
            System.out.println();

            // Perform database operations
            performDatabaseOperations(pool);

            // Test concurrent access
            testConcurrentAccess(pool);

            // Cleanup
            System.out.println("\n=== Shutting down connection pool ===");
            pool.shutdown();
            System.out.println("Pool shutdown: " + pool.isShutdown());

        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Sets up the database schema and initial data
     */
    private static void setupDatabase(DatabaseConnection pool) throws SQLException {
        System.out.println("=== Setting up database ===");

        // Create users table
        pool.executeUpdate(
            "CREATE TABLE IF NOT EXISTS users (" +
            "id INT PRIMARY KEY AUTO_INCREMENT, " +
            "name VARCHAR(100), " +
            "email VARCHAR(100), " +
            "age INT)"
        );

        // Insert sample data
        pool.executeUpdate("INSERT INTO users (name, email, age) VALUES ('Alice', 'alice@example.com', 30)");
        pool.executeUpdate("INSERT INTO users (name, email, age) VALUES ('Bob', 'bob@example.com', 25)");
        pool.executeUpdate("INSERT INTO users (name, email, age) VALUES ('Charlie', 'charlie@example.com', 35)");

        System.out.println("Database setup complete");
        System.out.println("Pool size after setup: " + pool.getPoolSize());
        System.out.println("Available connections: " + pool.getAvailableConnections());
        System.out.println();
    }

    /**
     * Performs various database operations
     */
    private static void performDatabaseOperations(DatabaseConnection pool) throws SQLException {
        System.out.println("=== Performing database operations ===");

        // Query all users
        Connection conn = pool.getConnection();
        try {
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM users");

            System.out.println("All users:");
            while (rs.next()) {
                System.out.printf("  ID: %d, Name: %s, Email: %s, Age: %d%n",
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getInt("age"));
            }
            rs.close();
            stmt.close();
        } finally {
            pool.releaseConnection(conn);
        }

        // Parameterized query
        System.out.println("\nUsers older than 28:");
        ResultSet rs2 = pool.executePreparedQuery("SELECT * FROM users WHERE age > ?", 28);
        while (rs2.next()) {
            System.out.printf("  Name: %s, Age: %d%n",
                rs2.getString("name"),
                rs2.getInt("age"));
        }
        rs2.close();

        // Update operation
        int updated = pool.executeUpdate("UPDATE users SET age = age + 1 WHERE name = 'Alice'");
        System.out.println("\nUpdated " + updated + " user(s)");

        System.out.println("Available connections: " + pool.getAvailableConnections());
    }

    /**
     * Tests concurrent access to the connection pool
     */
    private static void testConcurrentAccess(DatabaseConnection pool) {
        System.out.println("\n=== Testing concurrent access ===");

        ExecutorService executor = Executors.newFixedThreadPool(5);

        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    Connection conn = pool.getConnection();
                    System.out.println("Thread " + threadId + " acquired connection");

                    Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery("SELECT COUNT(*) as cnt FROM users");
                    if (rs.next()) {
                        System.out.println("Thread " + threadId + " - User count: " + rs.getInt("cnt"));
                    }
                    rs.close();
                    stmt.close();

                    Thread.sleep(100);

                    pool.releaseConnection(conn);
                    System.out.println("Thread " + threadId + " released connection");

                } catch (SQLException | InterruptedException e) {
                    System.err.println("Thread " + threadId + " error: " + e.getMessage());
                }
            });
        }

        executor.shutdown();
        try {
            executor.awaitTermination(10, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            System.err.println("Executor interrupted: " + e.getMessage());
        }

        System.out.println("Concurrent access test complete");
        System.out.println("Final pool size: " + pool.getPoolSize());
        System.out.println("Final available connections: " + pool.getAvailableConnections());
    }
}
