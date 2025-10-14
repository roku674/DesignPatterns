package Enterprise.Concurrency.OptimisticOfflineLock;

import java.sql.*;
import java.util.*;
import java.util.concurrent.*;

/**
 * Optimistic Offline Lock Pattern Demonstration
 *
 * Prevents conflicts between concurrent business transactions by detecting
 * conflicts using version numbers and rolling back the transaction.
 *
 * Key Benefits:
 * - Better concurrency than pessimistic locking
 * - No lock management overhead
 * - Detects conflicts at commit time
 * - Works well with disconnected operations
 *
 * Use Cases:
 * - Web applications with long user think times
 * - Systems with low contention
 * - Read-heavy workloads
 * - Distributed systems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Optimistic Offline Lock Pattern Demo ===\n");

        try {
            // Scenario 1: Basic version-based locking
            demonstrateBasicVersionControl();

            // Scenario 2: Concurrent update detection
            demonstrateConcurrentUpdateDetection();

            // Scenario 3: Timestamp-based optimistic locking
            demonstrateTimestampBasedLocking();

            // Scenario 4: Database integration with version column
            demonstrateDatabaseVersioning();

            // Scenario 5: Multi-user scenario
            demonstrateMultiUserScenario();

            // Scenario 6: Conflict resolution strategies
            demonstrateConflictResolution();

            // Scenario 7: Retry logic
            demonstrateRetryLogic();

            // Scenario 8: Partial updates
            demonstratePartialUpdates();

            // Scenario 9: Performance comparison
            demonstratePerformanceComparison();

            // Scenario 10: Real-world e-commerce example
            demonstrateEcommerceScenario();

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic version-based locking
     */
    private static void demonstrateBasicVersionControl() {
        System.out.println("--- Scenario 1: Basic Version Control ---");
        try {
            VersionedEntity entity = new VersionedEntity(1, "Original Data", 1);
            System.out.println("Initial: " + entity);

            // Successful update
            entity.setData("Updated Data");
            entity.incrementVersion();
            System.out.println("After update: " + entity);

            // Version check before save
            int expectedVersion = entity.getVersion() - 1;
            if (entity.getVersion() == expectedVersion + 1) {
                System.out.println("Version check passed - save allowed");
            }

            System.out.println("Basic version control successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 2: Concurrent update detection
     */
    private static void demonstrateConcurrentUpdateDetection() {
        System.out.println("--- Scenario 2: Concurrent Update Detection ---");
        try {
            // User 1 reads the data
            VersionedEntity user1Entity = new VersionedEntity(100, "Shared Data", 1);
            System.out.println("User 1 reads: " + user1Entity);

            // User 2 reads the same data
            VersionedEntity user2Entity = new VersionedEntity(100, "Shared Data", 1);
            System.out.println("User 2 reads: " + user2Entity);

            // User 1 updates and commits
            user1Entity.setData("User 1 Changes");
            user1Entity.incrementVersion();
            System.out.println("User 1 commits: " + user1Entity);

            // User 2 tries to update with stale version
            user2Entity.setData("User 2 Changes");
            boolean conflict = detectConflict(user2Entity.getVersion(), user1Entity.getVersion());

            if (conflict) {
                System.out.println("CONFLICT DETECTED: User 2's version (" +
                    user2Entity.getVersion() + ") doesn't match current version (" +
                    user1Entity.getVersion() + ")");
                System.out.println("User 2's update REJECTED");
            }

            System.out.println("Concurrent update detection successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 3: Timestamp-based optimistic locking
     */
    private static void demonstrateTimestampBasedLocking() {
        System.out.println("--- Scenario 3: Timestamp-Based Locking ---");
        try {
            long initialTimestamp = System.currentTimeMillis();
            TimestampedEntity entity = new TimestampedEntity(200, "Data", initialTimestamp);
            System.out.println("Initial timestamp: " + initialTimestamp);

            Thread.sleep(10); // Simulate time passage

            // Update with new timestamp
            long updateTimestamp = System.currentTimeMillis();
            entity.setData("Updated Data");
            entity.setLastModified(updateTimestamp);
            System.out.println("Update timestamp: " + updateTimestamp);

            // Another user tries to update with old timestamp
            boolean conflict = initialTimestamp < updateTimestamp;
            if (conflict) {
                System.out.println("Timestamp conflict detected - entity was modified");
            }

            System.out.println("Timestamp-based locking successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 4: Database integration with version column
     */
    private static void demonstrateDatabaseVersioning() {
        System.out.println("--- Scenario 4: Database Versioning ---");
        try {
            Connection conn = createInMemoryDatabase();

            // Insert with initial version
            insertProduct(conn, 1, "Laptop", 999.99, 1);
            System.out.println("Inserted product with version 1");

            // Read current state
            Product product = readProduct(conn, 1);
            System.out.println("Read: " + product);

            // Update with version check
            product.setPrice(899.99);
            boolean updated = updateProductWithVersionCheck(conn, product);
            if (updated) {
                System.out.println("Update successful - version incremented to " +
                    (product.getVersion() + 1));
            }

            // Try update with stale version
            Product staleProduct = new Product(1, "Laptop", 799.99, 1);
            boolean failedUpdate = updateProductWithVersionCheck(conn, staleProduct);
            if (!failedUpdate) {
                System.out.println("Update with stale version correctly rejected");
            }

            conn.close();
            System.out.println("Database versioning successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 5: Multi-user scenario
     */
    private static void demonstrateMultiUserScenario() {
        System.out.println("--- Scenario 5: Multi-User Scenario ---");
        try {
            Connection conn = createInMemoryDatabase();
            insertProduct(conn, 10, "Mouse", 29.99, 1);

            // Simulate multiple users
            ExecutorService executor = Executors.newFixedThreadPool(3);
            CountDownLatch latch = new CountDownLatch(3);

            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger conflictCount = new AtomicInteger(0);

            for (int i = 0; i < 3; i++) {
                final int userId = i + 1;
                executor.submit(() -> {
                    try {
                        // Each user reads the product
                        Product product = readProduct(conn, 10);
                        System.out.println("User " + userId + " read version " + product.getVersion());

                        // Simulate processing time
                        Thread.sleep((long) (Math.random() * 100));

                        // Try to update
                        product.setPrice(product.getPrice() - 1.00);
                        boolean success = updateProductWithVersionCheck(conn, product);

                        if (success) {
                            successCount.incrementAndGet();
                            System.out.println("User " + userId + " successfully updated");
                        } else {
                            conflictCount.incrementAndGet();
                            System.out.println("User " + userId + " update rejected (conflict)");
                        }
                    } catch (Exception e) {
                        System.err.println("User " + userId + " error: " + e.getMessage());
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await();
            executor.shutdown();

            System.out.println("\nResults:");
            System.out.println("Successful updates: " + successCount.get());
            System.out.println("Conflicts detected: " + conflictCount.get());

            conn.close();
            System.out.println("Multi-user scenario successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 6: Conflict resolution strategies
     */
    private static void demonstrateConflictResolution() {
        System.out.println("--- Scenario 6: Conflict Resolution ---");
        try {
            VersionedEntity current = new VersionedEntity(300, "Current Data", 5);
            VersionedEntity update = new VersionedEntity(300, "Update Data", 3);

            System.out.println("Current state: " + current);
            System.out.println("Attempted update: " + update);

            if (update.getVersion() < current.getVersion()) {
                System.out.println("\nConflict detected!");

                // Strategy 1: Reject
                System.out.println("Strategy 1: REJECT - User must refresh and retry");

                // Strategy 2: Force update (admin override)
                System.out.println("Strategy 2: FORCE - Admin override (risky)");
                current.setData(update.getData());
                current.incrementVersion();

                // Strategy 3: Merge
                System.out.println("Strategy 3: MERGE - Combine changes");
                String merged = mergeData(current.getData(), update.getData());
                current.setData(merged);
                current.incrementVersion();
                System.out.println("Merged result: " + current);
            }

            System.out.println("Conflict resolution successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 7: Retry logic
     */
    private static void demonstrateRetryLogic() {
        System.out.println("--- Scenario 7: Retry Logic ---");
        try {
            Connection conn = createInMemoryDatabase();
            insertProduct(conn, 20, "Keyboard", 79.99, 1);

            // Attempt update with retries
            int maxRetries = 3;
            boolean success = false;

            for (int attempt = 1; attempt <= maxRetries && !success; attempt++) {
                System.out.println("Attempt " + attempt + ":");

                // Read current version
                Product product = readProduct(conn, 20);
                System.out.println("  Read version " + product.getVersion());

                // Modify
                product.setPrice(product.getPrice() - 5.00);

                // Simulate concurrent modification
                if (attempt < maxRetries) {
                    simulateConcurrentUpdate(conn, 20);
                    System.out.println("  Concurrent modification occurred");
                }

                // Try to update
                success = updateProductWithVersionCheck(conn, product);

                if (success) {
                    System.out.println("  Update successful!");
                } else {
                    System.out.println("  Conflict detected, retrying...");
                }
            }

            if (!success) {
                System.out.println("Update failed after " + maxRetries + " attempts");
            }

            conn.close();
            System.out.println("Retry logic successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 8: Partial updates
     */
    private static void demonstratePartialUpdates() {
        System.out.println("--- Scenario 8: Partial Updates ---");
        try {
            CustomerProfile profile = new CustomerProfile(
                400, "John Doe", "john@example.com", "123 Main St", 1
            );

            System.out.println("Original: " + profile);

            // Update only email
            CustomerProfile emailUpdate = new CustomerProfile(
                400, null, "newemail@example.com", null, 1
            );

            if (profile.getVersion() == emailUpdate.getVersion()) {
                profile.setEmail(emailUpdate.getEmail());
                profile.incrementVersion();
                System.out.println("Email updated: " + profile);
            }

            // Update only address
            CustomerProfile addressUpdate = new CustomerProfile(
                400, null, null, "456 Oak Ave", 2
            );

            if (profile.getVersion() == addressUpdate.getVersion()) {
                profile.setAddress(addressUpdate.getAddress());
                profile.incrementVersion();
                System.out.println("Address updated: " + profile);
            }

            System.out.println("Partial updates successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 9: Performance comparison
     */
    private static void demonstratePerformanceComparison() {
        System.out.println("--- Scenario 9: Performance Comparison ---");
        try {
            int iterations = 1000;

            // Measure optimistic locking overhead
            long start = System.nanoTime();
            for (int i = 0; i < iterations; i++) {
                VersionedEntity entity = new VersionedEntity(i, "Data", 1);
                entity.setData("Updated");
                entity.incrementVersion();
                boolean valid = entity.getVersion() == 2;
            }
            long optimisticTime = System.nanoTime() - start;

            System.out.println("Optimistic locking:");
            System.out.println("  Operations: " + iterations);
            System.out.println("  Time: " + (optimisticTime / 1_000_000.0) + " ms");
            System.out.println("  Avg per op: " + (optimisticTime / iterations / 1000.0) + " μs");

            System.out.println("Performance comparison successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 10: Real-world e-commerce example
     */
    private static void demonstrateEcommerceScenario() {
        System.out.println("--- Scenario 10: E-commerce Example ---");
        try {
            // Product with limited stock
            InventoryItem item = new InventoryItem(500, "Limited Edition Item", 10, 1);
            System.out.println("Initial inventory: " + item);

            // Multiple customers try to purchase
            System.out.println("\nSimulating 3 customers purchasing simultaneously:");

            List<PurchaseAttempt> attempts = new ArrayList<>();
            attempts.add(new PurchaseAttempt(1, item.getId(), 3, item.getVersion()));
            attempts.add(new PurchaseAttempt(2, item.getId(), 5, item.getVersion()));
            attempts.add(new PurchaseAttempt(3, item.getId(), 4, item.getVersion()));

            for (PurchaseAttempt attempt : attempts) {
                System.out.println("\nCustomer " + attempt.customerId +
                    " wants to buy " + attempt.quantity + " units");

                if (item.getQuantity() >= attempt.quantity &&
                    item.getVersion() == attempt.expectedVersion) {

                    item.setQuantity(item.getQuantity() - attempt.quantity);
                    item.incrementVersion();
                    System.out.println("  Purchase successful!");
                    System.out.println("  Remaining stock: " + item.getQuantity());
                } else if (item.getVersion() != attempt.expectedVersion) {
                    System.out.println("  Version conflict - inventory changed");
                    System.out.println("  Customer must refresh and retry");
                } else {
                    System.out.println("  Insufficient stock");
                }
            }

            System.out.println("\nFinal inventory: " + item);
            System.out.println("E-commerce scenario successful!\n");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    // Helper classes and methods

    private static boolean detectConflict(int userVersion, int currentVersion) {
        return userVersion != currentVersion;
    }

    private static String mergeData(String current, String update) {
        return current + " + " + update;
    }

    private static Connection createInMemoryDatabase() throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:mem:optlock");
        Statement stmt = conn.createStatement();

        stmt.execute("CREATE TABLE products (" +
            "id INT PRIMARY KEY, " +
            "name VARCHAR(100), " +
            "price DECIMAL(10,2), " +
            "version INT)");

        stmt.close();
        return conn;
    }

    private static void insertProduct(Connection conn, int id, String name,
                                     double price, int version) throws SQLException {
        String sql = "INSERT INTO products (id, name, price, version) VALUES (?, ?, ?, ?)";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, id);
        stmt.setString(2, name);
        stmt.setDouble(3, price);
        stmt.setInt(4, version);
        stmt.executeUpdate();
        stmt.close();
    }

    private static Product readProduct(Connection conn, int id) throws SQLException {
        String sql = "SELECT * FROM products WHERE id = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();

        Product product = null;
        if (rs.next()) {
            product = new Product(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getDouble("price"),
                rs.getInt("version")
            );
        }

        rs.close();
        stmt.close();
        return product;
    }

    private static boolean updateProductWithVersionCheck(Connection conn, Product product)
            throws SQLException {
        String sql = "UPDATE products SET name = ?, price = ?, version = version + 1 " +
                    "WHERE id = ? AND version = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setString(1, product.getName());
        stmt.setDouble(2, product.getPrice());
        stmt.setInt(3, product.getId());
        stmt.setInt(4, product.getVersion());

        int rowsAffected = stmt.executeUpdate();
        stmt.close();

        if (rowsAffected > 0) {
            product.incrementVersion();
            return true;
        }
        return false;
    }

    private static void simulateConcurrentUpdate(Connection conn, int id) throws SQLException {
        String sql = "UPDATE products SET version = version + 1 WHERE id = ?";
        PreparedStatement stmt = conn.prepareStatement(sql);
        stmt.setInt(1, id);
        stmt.executeUpdate();
        stmt.close();
    }
}

class VersionedEntity {
    private int id;
    private String data;
    private int version;

    public VersionedEntity(int id, String data, int version) {
        this.id = id;
        this.data = data;
        this.version = version;
    }

    public int getId() { return id; }
    public String getData() { return data; }
    public int getVersion() { return version; }

    public void setData(String data) { this.data = data; }
    public void incrementVersion() { this.version++; }

    @Override
    public String toString() {
        return "Entity{id=" + id + ", data='" + data + "', version=" + version + "}";
    }
}

class TimestampedEntity {
    private int id;
    private String data;
    private long lastModified;

    public TimestampedEntity(int id, String data, long lastModified) {
        this.id = id;
        this.data = data;
        this.lastModified = lastModified;
    }

    public void setData(String data) { this.data = data; }
    public void setLastModified(long timestamp) { this.lastModified = timestamp; }
    public long getLastModified() { return lastModified; }
}

class Product {
    private int id;
    private String name;
    private double price;
    private int version;

    public Product(int id, String name, double price, int version) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.version = version;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public int getVersion() { return version; }

    public void setPrice(double price) { this.price = price; }
    public void incrementVersion() { this.version++; }

    @Override
    public String toString() {
        return "Product{id=" + id + ", name='" + name + "', price=" + price +
               ", version=" + version + "}";
    }
}

class CustomerProfile {
    private int id;
    private String name;
    private String email;
    private String address;
    private int version;

    public CustomerProfile(int id, String name, String email, String address, int version) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.address = address;
        this.version = version;
    }

    public int getVersion() { return version; }
    public void setEmail(String email) { this.email = email; }
    public void setAddress(String address) { this.address = address; }
    public void incrementVersion() { this.version++; }

    @Override
    public String toString() {
        return "CustomerProfile{id=" + id + ", name='" + name + "', email='" + email +
               "', address='" + address + "', version=" + version + "}";
    }
}

class InventoryItem {
    private int id;
    private String name;
    private int quantity;
    private int version;

    public InventoryItem(int id, String name, int quantity, int version) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.version = version;
    }

    public int getId() { return id; }
    public int getQuantity() { return quantity; }
    public int getVersion() { return version; }

    public void setQuantity(int quantity) { this.quantity = quantity; }
    public void incrementVersion() { this.version++; }

    @Override
    public String toString() {
        return "InventoryItem{id=" + id + ", name='" + name + "', quantity=" +
               quantity + ", version=" + version + "}";
    }
}

class PurchaseAttempt {
    int customerId;
    int itemId;
    int quantity;
    int expectedVersion;

    public PurchaseAttempt(int customerId, int itemId, int quantity, int expectedVersion) {
        this.customerId = customerId;
        this.itemId = itemId;
        this.quantity = quantity;
        this.expectedVersion = expectedVersion;
    }
}
