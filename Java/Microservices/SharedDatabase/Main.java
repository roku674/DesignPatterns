package Microservices.SharedDatabase;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;

/**
 * Shared Database Pattern Demonstration
 *
 * Multiple microservices share access to the same database. While this pattern
 * is simpler than database-per-service, it introduces tight coupling between services.
 *
 * Key Concepts:
 * - Single database shared by multiple services
 * - Services access tables or schemas
 * - Direct database access from each service
 * - ACID transactions possible across services
 *
 * Advantages:
 * - Simple to implement and understand
 * - Easy to perform joins and transactions
 * - Consistent data across services
 * - No need for distributed transactions
 *
 * Disadvantages:
 * - Tight coupling between services
 * - Harder to scale services independently
 * - Schema changes affect multiple services
 * - Services can interfere with each other
 * - Difficult migration to microservices
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Shared Database Pattern Demo ===\n");

        // Scenario 1: Basic shared database access
        demonstrateBasicSharedDatabase();

        // Scenario 2: Multiple services accessing same tables
        demonstrateSameTableAccess();

        // Scenario 3: Schema-based separation
        demonstrateSchemaSeparation();

        // Scenario 4: Transaction coordination
        demonstrateTransactionCoordination();

        // Scenario 5: Database locking and contention
        demonstrateDatabaseContention();

        // Scenario 6: Schema evolution challenges
        demonstrateSchemaEvolution();

        // Scenario 7: View-based abstraction
        demonstrateViewBasedAbstraction();

        // Scenario 8: Connection pool sharing
        demonstrateConnectionPooling();

        // Scenario 9: Migration from shared to per-service
        demonstrateMigrationPath();

        // Scenario 10: Real-world monolith transitioning to microservices
        demonstrateRealWorldTransition();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic shared database access
     * Demonstrates fundamental shared database pattern.
     */
    private static void demonstrateBasicSharedDatabase() {
        System.out.println("1. Basic Shared Database Access");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("EcommerceDB");

        // Multiple services accessing the same database
        UserService userService = new UserService(database);
        OrderService orderService = new OrderService(database);
        ProductService productService = new ProductService(database);

        System.out.println("\nAll services connect to the same database:");
        userService.createUser("user123", "Alice");
        productService.createProduct("prod456", "Laptop");
        orderService.createOrder("order789", "user123", "prod456");

        System.out.println("\nServices share database infrastructure");

        System.out.println();
    }

    /**
     * Scenario 2: Multiple services accessing same tables
     * Demonstrates services directly accessing shared tables.
     */
    private static void demonstrateSameTableAccess() {
        System.out.println("2. Multiple Services Accessing Same Tables");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("SharedDB");

        UserService userService = new UserService(database);
        AnalyticsService analyticsService = new AnalyticsService(database);
        ReportingService reportingService = new ReportingService(database);

        System.out.println("\nUserService writes to users table:");
        userService.createUser("user123", "Alice");

        System.out.println("\nAnalyticsService reads from users table:");
        analyticsService.analyzeUsers();

        System.out.println("\nReportingService reads from users table:");
        reportingService.generateUserReport();

        System.out.println("\nMultiple services can access same tables directly");

        System.out.println();
    }

    /**
     * Scenario 3: Schema-based separation
     * Demonstrates logical separation using database schemas.
     */
    private static void demonstrateSchemaSeparation() {
        System.out.println("3. Schema-Based Separation");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("EnterpriseDB");

        System.out.println("\nServices use separate schemas in same database:");

        database.createSchema("user_schema");
        database.createSchema("order_schema");
        database.createSchema("product_schema");

        System.out.println("\nUserService accesses user_schema:");
        database.insert("user_schema.users", "user123", "Alice");

        System.out.println("OrderService accesses order_schema:");
        database.insert("order_schema.orders", "order456", "Order data");

        System.out.println("ProductService accesses product_schema:");
        database.insert("product_schema.products", "prod789", "Product data");

        System.out.println("\nSchemas provide logical separation within shared database");

        System.out.println();
    }

    /**
     * Scenario 4: Transaction coordination
     * Demonstrates ACID transactions across services.
     */
    private static void demonstrateTransactionCoordination() {
        System.out.println("4. Transaction Coordination");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("TransactionalDB");

        System.out.println("\nExecuting multi-service transaction:");

        database.beginTransaction();

        try {
            System.out.println("  Step 1: UserService - Create user");
            database.insert("users", "user123", "Alice");

            System.out.println("  Step 2: OrderService - Create order");
            database.insert("orders", "order456", "Order for user123");

            System.out.println("  Step 3: PaymentService - Process payment");
            database.insert("payments", "pay789", "Payment for order456");

            database.commit();
            System.out.println("\nTransaction committed successfully");
        } catch (Exception e) {
            database.rollback();
            System.out.println("\nTransaction rolled back due to error");
        }

        System.out.println("\nShared database enables simple ACID transactions");

        System.out.println();
    }

    /**
     * Scenario 5: Database locking and contention
     * Demonstrates resource contention issues.
     */
    private static void demonstrateDatabaseContention() {
        System.out.println("5. Database Locking and Contention");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("ContentionDB");

        System.out.println("\nSimulating concurrent access:");

        // Service A holds lock
        System.out.println("Service A: Acquiring lock on users table");
        database.acquireLock("users");
        database.update("users", "user123", "Updated by A");

        // Service B tries to access
        System.out.println("\nService B: Attempting to access users table");
        System.out.println("  Waiting for lock... (blocked by Service A)");

        // Service A releases lock
        database.releaseLock("users");
        System.out.println("\nService A: Released lock");

        System.out.println("Service B: Acquired lock and proceeding");
        database.update("users", "user456", "Updated by B");

        System.out.println("\nShared database can cause contention and blocking");

        System.out.println();
    }

    /**
     * Scenario 6: Schema evolution challenges
     * Demonstrates difficulties with schema changes.
     */
    private static void demonstrateSchemaEvolution() {
        System.out.println("6. Schema Evolution Challenges");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("EvolvingDB");

        System.out.println("\nInitial schema:");
        database.executeSQL("CREATE TABLE users (id INT, name VARCHAR)");

        System.out.println("\nServices A and B using table:");
        database.query("SELECT * FROM users");

        System.out.println("\nService A needs to add email column:");
        System.out.println("  WARNING: Schema change will affect Service B!");
        database.executeSQL("ALTER TABLE users ADD COLUMN email VARCHAR");

        System.out.println("\nService B must be updated to handle new schema:");
        System.out.println("  Coordination required across all services");
        System.out.println("  Deployment must be carefully orchestrated");

        System.out.println("\nSchema changes in shared database affect all services");

        System.out.println();
    }

    /**
     * Scenario 7: View-based abstraction
     * Demonstrates using database views to provide abstraction.
     */
    private static void demonstrateViewBasedAbstraction() {
        System.out.println("7. View-Based Abstraction");
        System.out.println("-".repeat(50));

        SharedDatabase database = new SharedDatabase("ViewDB");

        System.out.println("\nCreating underlying tables:");
        database.executeSQL("CREATE TABLE users (id, name, email, password_hash)");
        database.executeSQL("CREATE TABLE orders (id, user_id, total, status)");

        System.out.println("\nCreating views for service abstraction:");
        database.executeSQL("CREATE VIEW public_users AS SELECT id, name FROM users");
        database.executeSQL("CREATE VIEW order_summary AS SELECT id, total, status FROM orders");

        System.out.println("\nServices access data through views:");
        System.out.println("  PublicService: SELECT * FROM public_users");
        System.out.println("  ReportingService: SELECT * FROM order_summary");

        System.out.println("\nViews provide abstraction layer over shared tables");

        System.out.println();
    }

    /**
     * Scenario 8: Connection pool sharing
     * Demonstrates shared connection pool management.
     */
    private static void demonstrateConnectionPooling() {
        System.out.println("8. Connection Pool Sharing");
        System.out.println("-".repeat(50));

        ConnectionPool pool = new ConnectionPool(10);
        SharedDatabase database = new SharedDatabase("PooledDB", pool);

        System.out.println("\nMultiple services sharing connection pool:");

        // Services requesting connections
        System.out.println("UserService: Requesting connection");
        Connection conn1 = pool.getConnection();

        System.out.println("OrderService: Requesting connection");
        Connection conn2 = pool.getConnection();

        System.out.println("ProductService: Requesting connection");
        Connection conn3 = pool.getConnection();

        System.out.println("\nActive connections: " + pool.getActiveConnections());
        System.out.println("Available connections: " + pool.getAvailableConnections());

        // Services releasing connections
        System.out.println("\nServices releasing connections back to pool");
        pool.releaseConnection(conn1);
        pool.releaseConnection(conn2);
        pool.releaseConnection(conn3);

        System.out.println("Available connections: " + pool.getAvailableConnections());

        System.out.println("\nShared connection pool optimizes database access");

        System.out.println();
    }

    /**
     * Scenario 9: Migration from shared to per-service
     * Demonstrates gradual migration strategy.
     */
    private static void demonstrateMigrationPath() {
        System.out.println("9. Migration from Shared to Per-Service Database");
        System.out.println("-".repeat(50));

        SharedDatabase sharedDB = new SharedDatabase("MonolithDB");

        System.out.println("\nPhase 1: Current state - All services use shared database");
        System.out.println("  UserService -> MonolithDB");
        System.out.println("  OrderService -> MonolithDB");
        System.out.println("  ProductService -> MonolithDB");

        System.out.println("\nPhase 2: Extract User Service");
        Database userDB = new Database("UserDB");
        System.out.println("  Migrating user data to UserDB");
        System.out.println("  UserService -> UserDB (new)");
        System.out.println("  OrderService -> MonolithDB");
        System.out.println("  ProductService -> MonolithDB");

        System.out.println("\nPhase 3: Extract Order Service");
        Database orderDB = new Database("OrderDB");
        System.out.println("  Migrating order data to OrderDB");
        System.out.println("  UserService -> UserDB");
        System.out.println("  OrderService -> OrderDB (new)");
        System.out.println("  ProductService -> MonolithDB");

        System.out.println("\nPhase 4: Complete migration");
        Database productDB = new Database("ProductDB");
        System.out.println("  Migrating product data to ProductDB");
        System.out.println("  UserService -> UserDB");
        System.out.println("  OrderService -> OrderDB");
        System.out.println("  ProductService -> ProductDB (new)");

        System.out.println("\nMigration complete - each service has its own database");

        System.out.println();
    }

    /**
     * Scenario 10: Real-world monolith transitioning to microservices
     * Demonstrates complete transition scenario.
     */
    private static void demonstrateRealWorldTransition() {
        System.out.println("10. Real-World Monolith to Microservices Transition");
        System.out.println("-".repeat(50));

        MonolithSystem monolith = new MonolithSystem();

        System.out.println("\nCurrent State: Monolithic application with shared database");
        monolith.processOrder("user123", "product456");

        System.out.println("\n" + "=".repeat(50));
        System.out.println("TRANSITION IN PROGRESS");
        System.out.println("=".repeat(50));

        MicroservicesSystem microservices = new MicroservicesSystem();

        System.out.println("\nTarget State: Microservices with database per service");
        microservices.processOrder("user123", "product456");

        System.out.println("\nTransition Strategy:");
        System.out.println("  1. Identify bounded contexts");
        System.out.println("  2. Extract service with Anti-Corruption Layer");
        System.out.println("  3. Implement data synchronization");
        System.out.println("  4. Migrate incrementally");
        System.out.println("  5. Remove shared database dependencies");

        System.out.println("\nShared Database is often a transitional pattern");

        System.out.println();
    }
}

/**
 * Shared database accessed by multiple services.
 */
class SharedDatabase {
    private final String name;
    private final Map<String, Map<String, Object>> tables;
    private final Set<String> locks;
    private boolean inTransaction;
    private final ConnectionPool connectionPool;

    public SharedDatabase(String name) {
        this.name = name;
        this.tables = new ConcurrentHashMap<>();
        this.locks = ConcurrentHashMap.newKeySet();
        this.inTransaction = false;
        this.connectionPool = null;
        System.out.println("Initialized shared database: " + name);
    }

    public SharedDatabase(String name, ConnectionPool connectionPool) {
        this.name = name;
        this.tables = new ConcurrentHashMap<>();
        this.locks = ConcurrentHashMap.newKeySet();
        this.inTransaction = false;
        this.connectionPool = connectionPool;
        System.out.println("Initialized shared database with connection pool: " + name);
    }

    public void insert(String table, String key, Object value) {
        tables.computeIfAbsent(table, k -> new ConcurrentHashMap<>()).put(key, value);
        System.out.println("  " + name + ": INSERT into " + table + " (" + key + ")");
    }

    public void update(String table, String key, Object value) {
        Map<String, Object> tableData = tables.get(table);
        if (tableData != null) {
            tableData.put(key, value);
            System.out.println("  " + name + ": UPDATE " + table + " SET (" + key + ")");
        }
    }

    public Object query(String sql) {
        System.out.println("  " + name + ": " + sql);
        return null;
    }

    public void executeSQL(String sql) {
        System.out.println("  " + name + ": " + sql);
    }

    public void createSchema(String schema) {
        System.out.println("  " + name + ": CREATE SCHEMA " + schema);
    }

    public void beginTransaction() {
        inTransaction = true;
        System.out.println("  " + name + ": BEGIN TRANSACTION");
    }

    public void commit() {
        inTransaction = false;
        System.out.println("  " + name + ": COMMIT");
    }

    public void rollback() {
        inTransaction = false;
        System.out.println("  " + name + ": ROLLBACK");
    }

    public void acquireLock(String resource) {
        locks.add(resource);
        System.out.println("  " + name + ": Lock acquired on " + resource);
    }

    public void releaseLock(String resource) {
        locks.remove(resource);
        System.out.println("  " + name + ": Lock released on " + resource);
    }

    public String getName() {
        return name;
    }
}

/**
 * Simple database representation.
 */
class Database {
    private final String name;

    public Database(String name) {
        this.name = name;
        System.out.println("  Created new database: " + name);
    }

    public String getName() {
        return name;
    }
}

/**
 * Database connection pool.
 */
class ConnectionPool {
    private final int maxConnections;
    private final Queue<Connection> availableConnections;
    private int activeConnections;

    public ConnectionPool(int maxConnections) {
        this.maxConnections = maxConnections;
        this.availableConnections = new ConcurrentLinkedQueue<>();
        this.activeConnections = 0;

        // Initialize pool
        for (int i = 0; i < maxConnections; i++) {
            availableConnections.offer(new Connection("conn_" + i));
        }

        System.out.println("Connection pool initialized with " + maxConnections + " connections");
    }

    public Connection getConnection() {
        Connection conn = availableConnections.poll();
        if (conn != null) {
            activeConnections++;
            System.out.println("  Acquired: " + conn.getId());
            return conn;
        }
        System.out.println("  No connections available");
        return null;
    }

    public void releaseConnection(Connection conn) {
        availableConnections.offer(conn);
        activeConnections--;
        System.out.println("  Released: " + conn.getId());
    }

    public int getActiveConnections() {
        return activeConnections;
    }

    public int getAvailableConnections() {
        return availableConnections.size();
    }
}

/**
 * Database connection representation.
 */
class Connection {
    private final String id;

    public Connection(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }
}

/**
 * User service accessing shared database.
 */
class UserService {
    private final SharedDatabase database;

    public UserService(SharedDatabase database) {
        this.database = database;
    }

    public void createUser(String userId, String name) {
        System.out.println("UserService: Creating user");
        database.insert("users", userId, name);
    }
}

/**
 * Order service accessing shared database.
 */
class OrderService {
    private final SharedDatabase database;

    public OrderService(SharedDatabase database) {
        this.database = database;
    }

    public void createOrder(String orderId, String userId, String productId) {
        System.out.println("OrderService: Creating order");
        Map<String, String> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("userId", userId);
        order.put("productId", productId);
        database.insert("orders", orderId, order);
    }
}

/**
 * Product service accessing shared database.
 */
class ProductService {
    private final SharedDatabase database;

    public ProductService(SharedDatabase database) {
        this.database = database;
    }

    public void createProduct(String productId, String name) {
        System.out.println("ProductService: Creating product");
        database.insert("products", productId, name);
    }
}

/**
 * Analytics service reading from shared database.
 */
class AnalyticsService {
    private final SharedDatabase database;

    public AnalyticsService(SharedDatabase database) {
        this.database = database;
    }

    public void analyzeUsers() {
        System.out.println("AnalyticsService: Analyzing user data");
        database.query("SELECT COUNT(*) FROM users");
    }
}

/**
 * Reporting service reading from shared database.
 */
class ReportingService {
    private final SharedDatabase database;

    public ReportingService(SharedDatabase database) {
        this.database = database;
    }

    public void generateUserReport() {
        System.out.println("ReportingService: Generating user report");
        database.query("SELECT * FROM users");
    }
}

/**
 * Monolithic system with shared database.
 */
class MonolithSystem {
    private final SharedDatabase database;

    public MonolithSystem() {
        this.database = new SharedDatabase("MonolithDB");
    }

    public void processOrder(String userId, String productId) {
        System.out.println("\nMonolith processing order:");

        database.beginTransaction();

        System.out.println("  1. Check user exists");
        database.query("SELECT * FROM users WHERE id = '" + userId + "'");

        System.out.println("  2. Check product exists");
        database.query("SELECT * FROM products WHERE id = '" + productId + "'");

        System.out.println("  3. Create order");
        database.insert("orders", "order_" + System.currentTimeMillis(), userId);

        System.out.println("  4. Process payment");
        database.insert("payments", "pay_" + System.currentTimeMillis(), "100.00");

        database.commit();

        System.out.println("All operations in single database transaction");
    }
}

/**
 * Microservices system with separate databases.
 */
class MicroservicesSystem {
    public MicroservicesSystem() {
        System.out.println("Microservices system with separate databases");
    }

    public void processOrder(String userId, String productId) {
        System.out.println("\nMicroservices processing order:");

        System.out.println("  1. UserService validates user (UserDB)");
        System.out.println("  2. ProductService checks product (ProductDB)");
        System.out.println("  3. OrderService creates order (OrderDB)");
        System.out.println("  4. PaymentService processes payment (PaymentDB)");
        System.out.println("  5. Services coordinate via events");

        System.out.println("Each service uses its own database");
    }
}
