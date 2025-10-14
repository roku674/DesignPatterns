package Microservices.DatabasePerService;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;

/**
 * Database Per Service Pattern Demonstration
 *
 * Each microservice has its own private database that only that service can access.
 * This pattern ensures loose coupling and allows services to choose the most
 * appropriate database technology for their needs.
 *
 * Key Concepts:
 * - Data isolation: Each service owns its data
 * - Polyglot persistence: Different services can use different databases
 * - Independent scaling: Databases scale independently
 * - Data consistency challenges: Distributed transactions across services
 *
 * Advantages:
 * - Strong service isolation and independence
 * - Services can use optimal database technology
 * - Database schema changes don't affect other services
 * - Better fault isolation
 *
 * Disadvantages:
 * - Distributed transactions are complex
 * - Data duplication may be necessary
 * - Joins across services require application-level logic
 * - Eventual consistency instead of immediate consistency
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Database Per Service Pattern Demo ===\n");

        // Scenario 1: Basic database per service architecture
        demonstrateBasicDatabasePerService();

        // Scenario 2: Polyglot persistence (different database types)
        demonstratePolyglotPersistence();

        // Scenario 3: Data isolation and independence
        demonstrateDataIsolation();

        // Scenario 4: Saga pattern for distributed transactions
        demonstrateSagaPattern();

        // Scenario 5: Event-driven data synchronization
        demonstrateEventDrivenSync();

        // Scenario 6: API composition for queries across services
        demonstrateAPIComposition();

        // Scenario 7: CQRS with separate databases
        demonstrateCQRS();

        // Scenario 8: Database migration per service
        demonstrateDatabaseMigration();

        // Scenario 9: Service-specific database optimization
        demonstrateDatabaseOptimization();

        // Scenario 10: Real-world e-commerce with database per service
        demonstrateRealWorldEcommerce();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic database per service architecture
     * Demonstrates fundamental database per service pattern.
     */
    private static void demonstrateBasicDatabasePerService() {
        System.out.println("1. Basic Database Per Service Architecture");
        System.out.println("-".repeat(50));

        // Create services with their own databases
        UserService userService = new UserService(new Database("UserDB"));
        OrderService orderService = new OrderService(new Database("OrderDB"));
        ProductService productService = new ProductService(new Database("ProductDB"));

        System.out.println("\nEach service has its own database:");
        userService.createUser("user123", "Alice");
        orderService.createOrder("order456", "user123");
        productService.createProduct("prod789", "Laptop");

        System.out.println("\nServices access only their own databases");

        System.out.println();
    }

    /**
     * Scenario 2: Polyglot persistence (different database types)
     * Demonstrates using different database technologies for different services.
     */
    private static void demonstratePolyglotPersistence() {
        System.out.println("2. Polyglot Persistence");
        System.out.println("-".repeat(50));

        System.out.println("\nServices use different database types:");

        RelationalDatabase userDB = new RelationalDatabase("PostgreSQL");
        DocumentDatabase productDB = new DocumentDatabase("MongoDB");
        KeyValueDatabase sessionDB = new KeyValueDatabase("Redis");
        GraphDatabase socialDB = new GraphDatabase("Neo4j");

        System.out.println("\nUser Service using " + userDB.getType());
        userDB.store("users", "user data");

        System.out.println("Product Service using " + productDB.getType());
        productDB.store("products", "product catalog");

        System.out.println("Session Service using " + sessionDB.getType());
        sessionDB.store("sessions", "active sessions");

        System.out.println("Social Service using " + socialDB.getType());
        socialDB.store("relationships", "user connections");

        System.out.println("\nEach service chooses optimal database technology");

        System.out.println();
    }

    /**
     * Scenario 3: Data isolation and independence
     * Demonstrates strong data isolation between services.
     */
    private static void demonstrateDataIsolation() {
        System.out.println("3. Data Isolation and Independence");
        System.out.println("-".repeat(50));

        Database userDB = new Database("UserDB");
        Database orderDB = new Database("OrderDB");

        System.out.println("\nService A (User) writes to its database:");
        userDB.insert("users", "user123", "Alice");

        System.out.println("\nService B (Order) cannot access User database:");
        System.out.println("  Attempting cross-service data access...");
        System.out.println("  Access DENIED - data is isolated");

        System.out.println("\nService B writes to its own database:");
        orderDB.insert("orders", "order456", "Order data");

        System.out.println("\nData isolation ensures service independence");

        System.out.println();
    }

    /**
     * Scenario 4: Saga pattern for distributed transactions
     * Demonstrates coordinating transactions across multiple services.
     */
    private static void demonstrateSagaPattern() {
        System.out.println("4. Saga Pattern for Distributed Transactions");
        System.out.println("-".repeat(50));

        Database orderDB = new Database("OrderDB");
        Database paymentDB = new Database("PaymentDB");
        Database inventoryDB = new Database("InventoryDB");

        SagaOrchestrator saga = new SagaOrchestrator();

        System.out.println("\nExecuting distributed transaction with Saga:");

        // Add saga steps
        saga.addStep(new SagaStep("CreateOrder", orderDB, "orders"));
        saga.addStep(new SagaStep("ProcessPayment", paymentDB, "payments"));
        saga.addStep(new SagaStep("ReserveInventory", inventoryDB, "inventory"));

        boolean success = saga.execute();

        if (success) {
            System.out.println("\nSaga completed successfully");
        } else {
            System.out.println("\nSaga failed - compensating transactions executed");
        }

        System.out.println();
    }

    /**
     * Scenario 5: Event-driven data synchronization
     * Demonstrates eventual consistency through events.
     */
    private static void demonstrateEventDrivenSync() {
        System.out.println("5. Event-Driven Data Synchronization");
        System.out.println("-".repeat(50));

        EventBus eventBus = new EventBus();
        Database userDB = new Database("UserDB");
        Database orderDB = new Database("OrderDB");
        Database notificationDB = new Database("NotificationDB");

        // Services subscribe to events
        eventBus.subscribe("UserCreated", data -> {
            System.out.println("  Order Service: User created, preparing recommendations");
            orderDB.insert("user_cache", data.get("userId"), data);
        });

        eventBus.subscribe("UserCreated", data -> {
            System.out.println("  Notification Service: Sending welcome email");
            notificationDB.insert("pending_notifications", data.get("userId"), "Welcome email");
        });

        System.out.println("\nUser Service creates user and publishes event:");
        userDB.insert("users", "user123", "Alice");
        Map<String, String> userData = new HashMap<>();
        userData.put("userId", "user123");
        userData.put("name", "Alice");
        eventBus.publish("UserCreated", userData);

        System.out.println("\nEvent-driven approach achieves eventual consistency");

        System.out.println();
    }

    /**
     * Scenario 6: API composition for queries across services
     * Demonstrates joining data from multiple services at API level.
     */
    private static void demonstrateAPIComposition() {
        System.out.println("6. API Composition for Cross-Service Queries");
        System.out.println("-".repeat(50));

        UserService userService = new UserService(new Database("UserDB"));
        OrderService orderService = new OrderService(new Database("OrderDB"));
        ProductService productService = new ProductService(new Database("ProductDB"));

        // Store data
        userService.createUser("user123", "Alice");
        orderService.createOrder("order456", "user123");
        productService.createProduct("prod789", "Laptop");

        System.out.println("\nAPI Gateway composes data from multiple services:");

        APIComposer composer = new APIComposer(userService, orderService, productService);
        composer.getUserOrderSummary("user123");

        System.out.println("\nAPI composition replaces database joins");

        System.out.println();
    }

    /**
     * Scenario 7: CQRS with separate databases
     * Demonstrates Command Query Responsibility Segregation.
     */
    private static void demonstrateCQRS() {
        System.out.println("7. CQRS with Separate Databases");
        System.out.println("-".repeat(50));

        Database writeDB = new Database("WriteDB");
        Database readDB = new Database("ReadDB");

        CQRSService cqrsService = new CQRSService(writeDB, readDB);

        System.out.println("\nCommand (Write) operation:");
        cqrsService.createOrder("order123", "user456", "product789");

        System.out.println("\nQuery (Read) operation from optimized read database:");
        cqrsService.getOrderSummary("order123");

        System.out.println("\nCQRS optimizes reads and writes separately");

        System.out.println();
    }

    /**
     * Scenario 8: Database migration per service
     * Demonstrates independent schema evolution.
     */
    private static void demonstrateDatabaseMigration() {
        System.out.println("8. Independent Database Migration");
        System.out.println("-".repeat(50));

        Database userDB = new Database("UserDB");

        System.out.println("\nInitial schema version 1.0:");
        userDB.executeSchema("CREATE TABLE users (id, name)");

        System.out.println("\nService evolves independently - migrating to version 2.0:");
        userDB.executeSchema("ALTER TABLE users ADD COLUMN email");

        System.out.println("\nService continues to operate during migration");

        System.out.println("\nMigration complete - other services unaffected");

        System.out.println();
    }

    /**
     * Scenario 9: Service-specific database optimization
     * Demonstrates optimizing each database for its service's needs.
     */
    private static void demonstrateDatabaseOptimization() {
        System.out.println("9. Service-Specific Database Optimization");
        System.out.println("-".repeat(50));

        Database productDB = new Database("ProductDB");
        Database analyticsDB = new Database("AnalyticsDB");

        System.out.println("\nProduct Service - optimized for transactional writes:");
        productDB.setConfiguration("transaction_isolation", "SERIALIZABLE");
        productDB.setConfiguration("write_buffer_size", "256MB");
        productDB.insert("products", "prod123", "Product data");

        System.out.println("\nAnalytics Service - optimized for read-heavy queries:");
        analyticsDB.setConfiguration("cache_size", "4GB");
        analyticsDB.setConfiguration("query_optimization", "AGGRESSIVE");
        analyticsDB.createIndex("reports", "date_column");

        System.out.println("\nEach database optimized for its workload");

        System.out.println();
    }

    /**
     * Scenario 10: Real-world e-commerce with database per service
     * Demonstrates complete e-commerce system with database per service.
     */
    private static void demonstrateRealWorldEcommerce() {
        System.out.println("10. Real-World E-Commerce System");
        System.out.println("-".repeat(50));

        // Create services with their databases
        EcommerceSystem ecommerce = new EcommerceSystem();

        System.out.println("\nProcessing complete order flow:\n");
        ecommerce.processOrder("user123", "product456", 2);

        System.out.println("\nDatabase Per Service enables:");
        System.out.println("  - Independent scaling of each service");
        System.out.println("  - Technology choice per service");
        System.out.println("  - Isolated failures");
        System.out.println("  - Independent deployment");

        System.out.println();
    }
}

/**
 * Generic database representation.
 */
class Database {
    private final String name;
    private final Map<String, Map<String, Object>> tables;
    private final Map<String, String> configuration;

    public Database(String name) {
        this.name = name;
        this.tables = new ConcurrentHashMap<>();
        this.configuration = new HashMap<>();
    }

    public void insert(String table, String key, Object value) {
        tables.computeIfAbsent(table, k -> new ConcurrentHashMap<>()).put(key, value);
        System.out.println("  " + name + ": INSERT into " + table + " (" + key + ")");
    }

    public Object get(String table, String key) {
        Map<String, Object> tableData = tables.get(table);
        return tableData != null ? tableData.get(key) : null;
    }

    public void executeSchema(String sql) {
        System.out.println("  " + name + ": Executing: " + sql);
    }

    public void setConfiguration(String key, String value) {
        configuration.put(key, value);
        System.out.println("  " + name + ": Set " + key + " = " + value);
    }

    public void createIndex(String table, String column) {
        System.out.println("  " + name + ": CREATE INDEX on " + table + "(" + column + ")");
    }

    public String getName() {
        return name;
    }
}

/**
 * Relational database.
 */
class RelationalDatabase {
    private final String type;

    public RelationalDatabase(String dbName) {
        this.type = dbName;
        System.out.println("Initialized " + dbName + " (Relational DB)");
    }

    public void store(String table, String data) {
        System.out.println("  Storing in " + type + " table: " + table);
    }

    public String getType() {
        return type;
    }
}

/**
 * Document database.
 */
class DocumentDatabase {
    private final String type;

    public DocumentDatabase(String dbName) {
        this.type = dbName;
        System.out.println("Initialized " + dbName + " (Document DB)");
    }

    public void store(String collection, String data) {
        System.out.println("  Storing in " + type + " collection: " + collection);
    }

    public String getType() {
        return type;
    }
}

/**
 * Key-value database.
 */
class KeyValueDatabase {
    private final String type;

    public KeyValueDatabase(String dbName) {
        this.type = dbName;
        System.out.println("Initialized " + dbName + " (Key-Value DB)");
    }

    public void store(String key, String value) {
        System.out.println("  Storing in " + type + ": " + key);
    }

    public String getType() {
        return type;
    }
}

/**
 * Graph database.
 */
class GraphDatabase {
    private final String type;

    public GraphDatabase(String dbName) {
        this.type = dbName;
        System.out.println("Initialized " + dbName + " (Graph DB)");
    }

    public void store(String nodeType, String data) {
        System.out.println("  Storing in " + type + " nodes: " + nodeType);
    }

    public String getType() {
        return type;
    }
}

/**
 * User service with its own database.
 */
class UserService {
    private final Database database;

    public UserService(Database database) {
        this.database = database;
    }

    public void createUser(String userId, String name) {
        System.out.println("UserService: Creating user");
        database.insert("users", userId, name);
    }

    public Object getUser(String userId) {
        return database.get("users", userId);
    }
}

/**
 * Order service with its own database.
 */
class OrderService {
    private final Database database;

    public OrderService(Database database) {
        this.database = database;
    }

    public void createOrder(String orderId, String userId) {
        System.out.println("OrderService: Creating order");
        Map<String, String> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("userId", userId);
        database.insert("orders", orderId, order);
    }

    public Object getOrder(String orderId) {
        return database.get("orders", orderId);
    }
}

/**
 * Product service with its own database.
 */
class ProductService {
    private final Database database;

    public ProductService(Database database) {
        this.database = database;
    }

    public void createProduct(String productId, String name) {
        System.out.println("ProductService: Creating product");
        database.insert("products", productId, name);
    }

    public Object getProduct(String productId) {
        return database.get("products", productId);
    }
}

/**
 * Saga orchestrator for distributed transactions.
 */
class SagaOrchestrator {
    private final List<SagaStep> steps;

    public SagaOrchestrator() {
        this.steps = new ArrayList<>();
    }

    public void addStep(SagaStep step) {
        steps.add(step);
    }

    public boolean execute() {
        List<SagaStep> completedSteps = new ArrayList<>();

        for (SagaStep step : steps) {
            System.out.println("  Executing: " + step.getName());
            boolean success = step.execute();

            if (!success) {
                System.out.println("  Step failed: " + step.getName());
                compensate(completedSteps);
                return false;
            }

            completedSteps.add(step);
        }

        return true;
    }

    private void compensate(List<SagaStep> completedSteps) {
        System.out.println("  Compensating previous steps:");
        for (int i = completedSteps.size() - 1; i >= 0; i--) {
            SagaStep step = completedSteps.get(i);
            System.out.println("    Compensating: " + step.getName());
            step.compensate();
        }
    }
}

/**
 * Individual saga step.
 */
class SagaStep {
    private final String name;
    private final Database database;
    private final String table;

    public SagaStep(String name, Database database, String table) {
        this.name = name;
        this.database = database;
        this.table = table;
    }

    public boolean execute() {
        database.insert(table, "saga_" + name, "step data");
        return Math.random() > 0.2; // Simulate occasional failure
    }

    public void compensate() {
        // In real implementation, would rollback the changes
        System.out.println("      Rolled back: " + name);
    }

    public String getName() {
        return name;
    }
}

/**
 * Event bus for inter-service communication.
 */
class EventBus {
    private final Map<String, List<EventHandler>> subscribers;

    public EventBus() {
        this.subscribers = new HashMap<>();
    }

    public void subscribe(String eventType, EventHandler handler) {
        subscribers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
    }

    public void publish(String eventType, Map<String, String> data) {
        System.out.println("  Publishing event: " + eventType);
        List<EventHandler> handlers = subscribers.get(eventType);
        if (handlers != null) {
            for (EventHandler handler : handlers) {
                handler.handle(data);
            }
        }
    }
}

/**
 * Event handler interface.
 */
interface EventHandler {
    void handle(Map<String, String> data);
}

/**
 * API composer for cross-service queries.
 */
class APIComposer {
    private final UserService userService;
    private final OrderService orderService;
    private final ProductService productService;

    public APIComposer(UserService userService, OrderService orderService, ProductService productService) {
        this.userService = userService;
        this.orderService = orderService;
        this.productService = productService;
    }

    public void getUserOrderSummary(String userId) {
        System.out.println("  Step 1: Get user from UserService");
        Object user = userService.getUser(userId);

        System.out.println("  Step 2: Get orders from OrderService");
        Object orders = orderService.getOrder("order456");

        System.out.println("  Step 3: Get product details from ProductService");
        Object product = productService.getProduct("prod789");

        System.out.println("  Step 4: Compose response from all services");
        System.out.println("  Composed result: User + Orders + Products");
    }
}

/**
 * CQRS service with separate read/write databases.
 */
class CQRSService {
    private final Database writeDB;
    private final Database readDB;

    public CQRSService(Database writeDB, Database readDB) {
        this.writeDB = writeDB;
        this.readDB = readDB;
    }

    public void createOrder(String orderId, String userId, String productId) {
        System.out.println("  Writing to write-optimized database");
        Map<String, String> order = new HashMap<>();
        order.put("orderId", orderId);
        order.put("userId", userId);
        order.put("productId", productId);
        writeDB.insert("orders", orderId, order);

        // Asynchronously sync to read database
        System.out.println("  Syncing to read-optimized database");
        readDB.insert("order_summaries", orderId, "Denormalized order view");
    }

    public void getOrderSummary(String orderId) {
        System.out.println("  Reading from read-optimized database");
        Object summary = readDB.get("order_summaries", orderId);
        System.out.println("  Retrieved pre-computed summary");
    }
}

/**
 * Complete e-commerce system.
 */
class EcommerceSystem {
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final InventoryService inventoryService;
    private final ShippingService shippingService;

    public EcommerceSystem() {
        this.userService = new UserService(new Database("UserDB"));
        this.productService = new ProductService(new Database("ProductDB"));
        this.orderService = new OrderService(new Database("OrderDB"));
        this.paymentService = new PaymentService(new Database("PaymentDB"));
        this.inventoryService = new InventoryService(new Database("InventoryDB"));
        this.shippingService = new ShippingService(new Database("ShippingDB"));
    }

    public void processOrder(String userId, String productId, int quantity) {
        System.out.println("Step 1: Validate user");
        userService.getUser(userId);

        System.out.println("\nStep 2: Check product availability");
        productService.getProduct(productId);

        System.out.println("\nStep 3: Reserve inventory");
        inventoryService.reserveStock(productId, quantity);

        System.out.println("\nStep 4: Create order");
        orderService.createOrder("order_" + System.currentTimeMillis(), userId);

        System.out.println("\nStep 5: Process payment");
        paymentService.processPayment(userId, 99.99);

        System.out.println("\nStep 6: Arrange shipping");
        shippingService.createShipment("order_" + System.currentTimeMillis(), userId);

        System.out.println("\nOrder processing complete - each service used its own database");
    }
}

/**
 * Payment service.
 */
class PaymentService {
    private final Database database;

    public PaymentService(Database database) {
        this.database = database;
    }

    public void processPayment(String userId, double amount) {
        System.out.println("PaymentService: Processing payment");
        database.insert("payments", "payment_" + userId, amount);
    }
}

/**
 * Inventory service.
 */
class InventoryService {
    private final Database database;

    public InventoryService(Database database) {
        this.database = database;
    }

    public void reserveStock(String productId, int quantity) {
        System.out.println("InventoryService: Reserving stock");
        database.insert("inventory", productId, quantity);
    }
}

/**
 * Shipping service.
 */
class ShippingService {
    private final Database database;

    public ShippingService(Database database) {
        this.database = database;
    }

    public void createShipment(String orderId, String userId) {
        System.out.println("ShippingService: Creating shipment");
        Map<String, String> shipment = new HashMap<>();
        shipment.put("orderId", orderId);
        shipment.put("userId", userId);
        database.insert("shipments", orderId, shipment);
    }
}
