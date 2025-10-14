package Enterprise.QueryObject;

import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * QueryObject Pattern Demonstration
 *
 * Intent: Encapsulates database query logic in an object that can be
 * manipulated, composed, and executed independently. This separates
 * query construction from execution and makes queries reusable.
 *
 * This pattern is particularly useful when:
 * - Building complex queries with multiple conditions
 * - Reusing common query patterns across the application
 * - Supporting dynamic query construction
 * - Implementing search functionality with filters
 * - Abstracting database-specific query syntax
 *
 * Real-world examples:
 * - E-commerce product search with filters
 * - User management queries
 * - Report generation with dynamic criteria
 * - Analytics queries with date ranges
 * - Log searching and filtering
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== QueryObject Pattern Demo ===\n");

        // Scenario 1: Product Search with Filters
        demonstrateProductSearch();

        // Scenario 2: User Query with Complex Criteria
        demonstrateUserQuery();

        // Scenario 3: Order History Query
        demonstrateOrderHistoryQuery();

        // Scenario 4: Employee Search
        demonstrateEmployeeSearch();

        // Scenario 5: Transaction Query with Date Range
        demonstrateTransactionQuery();

        // Scenario 6: Customer Segmentation Query
        demonstrateCustomerSegmentation();

        // Scenario 7: Inventory Query with Stock Levels
        demonstrateInventoryQuery();

        // Scenario 8: Log Search with Multiple Filters
        demonstrateLogSearch();

        // Scenario 9: Sales Analytics Query
        demonstrateSalesAnalytics();

        // Scenario 10: Property Search with Location and Features
        demonstratePropertySearch();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: E-commerce product search with multiple filters
     */
    private static void demonstrateProductSearch() {
        System.out.println("--- Scenario 1: Product Search Query ---");

        ProductRepository repo = new ProductRepository();

        // Build complex query
        ProductQuery query = new ProductQuery()
            .inCategory("Electronics")
            .priceRange(100, 1000)
            .withRating(4.0)
            .inStock()
            .sortBy("price", "ASC")
            .limit(5);

        System.out.println("Query: " + query.toSql());

        List<Product> results = repo.find(query);
        System.out.println("Found " + results.size() + " products");
        results.forEach(p -> System.out.println("  - " + p));

        System.out.println();
    }

    /**
     * Scenario 2: User query with complex criteria
     */
    private static void demonstrateUserQuery() {
        System.out.println("--- Scenario 2: User Query ---");

        UserRepository repo = new UserRepository();

        // Query for premium active users
        UserQuery query = new UserQuery()
            .withStatus("ACTIVE")
            .withRole("PREMIUM")
            .registeredAfter("2024-01-01")
            .withEmailVerified(true)
            .sortBy("lastLogin", "DESC");

        System.out.println("Query: " + query.toSql());

        List<User> results = repo.find(query);
        System.out.println("Found " + results.size() + " users");
        results.forEach(u -> System.out.println("  - " + u));

        System.out.println();
    }

    /**
     * Scenario 3: Order history with date range and status
     */
    private static void demonstrateOrderHistoryQuery() {
        System.out.println("--- Scenario 3: Order History Query ---");

        OrderRepository repo = new OrderRepository();

        // Query orders for a customer
        OrderQuery query = new OrderQuery()
            .forCustomer("CUST-123")
            .dateRange("2024-01-01", "2024-12-31")
            .withStatus("COMPLETED")
            .minimumAmount(50.0)
            .sortBy("orderDate", "DESC")
            .limit(10);

        System.out.println("Query: " + query.toSql());

        List<Order> results = repo.find(query);
        System.out.println("Found " + results.size() + " orders");
        results.forEach(o -> System.out.println("  - " + o));

        System.out.println();
    }

    /**
     * Scenario 4: Employee search with department and skills
     */
    private static void demonstrateEmployeeSearch() {
        System.out.println("--- Scenario 4: Employee Search Query ---");

        EmployeeRepository repo = new EmployeeRepository();

        // Search for developers in engineering
        EmployeeQuery query = new EmployeeQuery()
            .inDepartment("Engineering")
            .withSkills(Arrays.asList("Java", "Spring"))
            .salaryRange(80000, 150000)
            .availableForProject(true)
            .sortBy("experience", "DESC");

        System.out.println("Query: " + query.toSql());

        List<Employee> results = repo.find(query);
        System.out.println("Found " + results.size() + " employees");
        results.forEach(e -> System.out.println("  - " + e));

        System.out.println();
    }

    /**
     * Scenario 5: Transaction query with date range and type
     */
    private static void demonstrateTransactionQuery() {
        System.out.println("--- Scenario 5: Transaction Query ---");

        TransactionRepository repo = new TransactionRepository();

        // Query high-value transactions
        TransactionQuery query = new TransactionQuery()
            .forAccount("ACC-789")
            .transactionType("DEBIT")
            .amountGreaterThan(1000.0)
            .dateRange("2024-10-01", "2024-10-31")
            .withCategory("TRANSFER")
            .sortBy("amount", "DESC");

        System.out.println("Query: " + query.toSql());

        List<Transaction> results = repo.find(query);
        System.out.println("Found " + results.size() + " transactions");
        results.forEach(t -> System.out.println("  - " + t));

        System.out.println();
    }

    /**
     * Scenario 6: Customer segmentation for marketing
     */
    private static void demonstrateCustomerSegmentation() {
        System.out.println("--- Scenario 6: Customer Segmentation Query ---");

        CustomerRepository repo = new CustomerRepository();

        // Find high-value customers
        CustomerQuery query = new CustomerQuery()
            .lifetimeValueGreaterThan(10000.0)
            .purchaseCountGreaterThan(20)
            .lastPurchaseWithin(30) // days
            .inRegion("North America")
            .withLoyaltyTier("GOLD")
            .sortBy("lifetimeValue", "DESC")
            .limit(100);

        System.out.println("Query: " + query.toSql());

        List<Customer> results = repo.find(query);
        System.out.println("Found " + results.size() + " customers");
        results.forEach(c -> System.out.println("  - " + c));

        System.out.println();
    }

    /**
     * Scenario 7: Inventory query with stock levels
     */
    private static void demonstrateInventoryQuery() {
        System.out.println("--- Scenario 7: Inventory Query ---");

        InventoryRepository repo = new InventoryRepository();

        // Find low stock items
        InventoryQuery query = new InventoryQuery()
            .inWarehouse("WH-01")
            .stockLevelBelow(10)
            .withReorderPoint(true)
            .inCategories(Arrays.asList("Electronics", "Accessories"))
            .sortBy("stockLevel", "ASC");

        System.out.println("Query: " + query.toSql());

        List<InventoryItem> results = repo.find(query);
        System.out.println("Found " + results.size() + " items needing reorder");
        results.forEach(i -> System.out.println("  - " + i));

        System.out.println();
    }

    /**
     * Scenario 8: Log search with multiple filters
     */
    private static void demonstrateLogSearch() {
        System.out.println("--- Scenario 8: Log Search Query ---");

        LogRepository repo = new LogRepository();

        // Search for error logs
        LogQuery query = new LogQuery()
            .withSeverity("ERROR")
            .fromService("payment-service")
            .dateRange("2024-10-14 00:00:00", "2024-10-14 23:59:59")
            .containingText("timeout")
            .excludeUser("system")
            .sortBy("timestamp", "DESC")
            .limit(50);

        System.out.println("Query: " + query.toSql());

        List<LogEntry> results = repo.find(query);
        System.out.println("Found " + results.size() + " log entries");
        results.forEach(l -> System.out.println("  - " + l));

        System.out.println();
    }

    /**
     * Scenario 9: Sales analytics with grouping
     */
    private static void demonstrateSalesAnalytics() {
        System.out.println("--- Scenario 9: Sales Analytics Query ---");

        SalesRepository repo = new SalesRepository();

        // Aggregate sales data
        SalesQuery query = new SalesQuery()
            .dateRange("2024-01-01", "2024-12-31")
            .byRegion("West")
            .byProductCategory("Electronics")
            .groupBy("month")
            .having("totalSales", ">", 100000.0)
            .sortBy("totalSales", "DESC");

        System.out.println("Query: " + query.toSql());

        List<SalesData> results = repo.find(query);
        System.out.println("Found " + results.size() + " sales records");
        results.forEach(s -> System.out.println("  - " + s));

        System.out.println();
    }

    /**
     * Scenario 10: Property search with location and features
     */
    private static void demonstratePropertySearch() {
        System.out.println("--- Scenario 10: Property Search Query ---");

        PropertyRepository repo = new PropertyRepository();

        // Search real estate listings
        PropertyQuery query = new PropertyQuery()
            .inCity("San Francisco")
            .priceRange(500000, 1500000)
            .minBedrooms(2)
            .minBathrooms(2)
            .withFeatures(Arrays.asList("parking", "balcony"))
            .nearTransit(0.5) // within 0.5 miles
            .availableForSale()
            .sortBy("price", "ASC")
            .limit(20);

        System.out.println("Query: " + query.toSql());

        List<Property> results = repo.find(query);
        System.out.println("Found " + results.size() + " properties");
        results.forEach(p -> System.out.println("  - " + p));

        System.out.println();
    }
}

// ============= Base Query Object Infrastructure =============

/**
 * Base query object with common functionality
 */
abstract class QueryObject<T> {
    protected Map<String, Object> criteria = new LinkedHashMap<>();
    protected String sortField;
    protected String sortOrder = "ASC";
    protected Integer limitValue;

    public abstract String toSql();

    protected String buildWhereClause() {
        if (criteria.isEmpty()) {
            return "";
        }
        return " WHERE " + criteria.entrySet().stream()
            .map(e -> e.getKey() + " = '" + e.getValue() + "'")
            .collect(Collectors.joining(" AND "));
    }

    protected String buildOrderByClause() {
        return sortField != null ? " ORDER BY " + sortField + " " + sortOrder : "";
    }

    protected String buildLimitClause() {
        return limitValue != null ? " LIMIT " + limitValue : "";
    }
}

// ============= Scenario 1: Product Query =============

class ProductQuery extends QueryObject<Product> {
    public ProductQuery inCategory(String category) {
        criteria.put("category", category);
        return this;
    }

    public ProductQuery priceRange(double min, double max) {
        criteria.put("price_min", min);
        criteria.put("price_max", max);
        return this;
    }

    public ProductQuery withRating(double minRating) {
        criteria.put("min_rating", minRating);
        return this;
    }

    public ProductQuery inStock() {
        criteria.put("in_stock", true);
        return this;
    }

    public ProductQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    public ProductQuery limit(int limit) {
        this.limitValue = limit;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM products" + buildWhereClause() + buildOrderByClause() + buildLimitClause();
    }
}

class Product {
    String id, name, category;
    double price, rating;
    boolean inStock;

    public Product(String name, String category, double price, double rating) {
        this.id = "P" + System.currentTimeMillis();
        this.name = name;
        this.category = category;
        this.price = price;
        this.rating = rating;
        this.inStock = true;
    }

    @Override
    public String toString() {
        return name + " ($" + price + ", " + rating + "★)";
    }
}

class ProductRepository {
    private List<Product> products = Arrays.asList(
        new Product("Laptop Pro", "Electronics", 899.99, 4.5),
        new Product("Wireless Mouse", "Electronics", 29.99, 4.8),
        new Product("USB-C Cable", "Electronics", 15.99, 4.3),
        new Product("Monitor 27\"", "Electronics", 349.99, 4.6)
    );

    public List<Product> find(ProductQuery query) {
        // Simulate database query execution
        return products.stream()
            .filter(p -> query.criteria.isEmpty() ||
                   (query.criteria.containsKey("category") &&
                    p.category.equals(query.criteria.get("category"))))
            .limit(query.limitValue != null ? query.limitValue : products.size())
            .collect(Collectors.toList());
    }
}

// ============= Scenario 2: User Query =============

class UserQuery extends QueryObject<User> {
    public UserQuery withStatus(String status) {
        criteria.put("status", status);
        return this;
    }

    public UserQuery withRole(String role) {
        criteria.put("role", role);
        return this;
    }

    public UserQuery registeredAfter(String date) {
        criteria.put("registered_after", date);
        return this;
    }

    public UserQuery withEmailVerified(boolean verified) {
        criteria.put("email_verified", verified);
        return this;
    }

    public UserQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM users" + buildWhereClause() + buildOrderByClause();
    }
}

class User {
    String id, email, role, status;
    boolean emailVerified;

    public User(String email, String role, String status) {
        this.id = "U" + System.currentTimeMillis();
        this.email = email;
        this.role = role;
        this.status = status;
        this.emailVerified = true;
    }

    @Override
    public String toString() {
        return email + " [" + role + ", " + status + "]";
    }
}

class UserRepository {
    private List<User> users = Arrays.asList(
        new User("alice@example.com", "PREMIUM", "ACTIVE"),
        new User("bob@example.com", "PREMIUM", "ACTIVE"),
        new User("carol@example.com", "BASIC", "ACTIVE")
    );

    public List<User> find(UserQuery query) {
        return users.stream()
            .filter(u -> query.criteria.isEmpty() || matchesCriteria(u, query))
            .collect(Collectors.toList());
    }

    private boolean matchesCriteria(User u, UserQuery query) {
        return (!query.criteria.containsKey("status") || u.status.equals(query.criteria.get("status"))) &&
               (!query.criteria.containsKey("role") || u.role.equals(query.criteria.get("role")));
    }
}

// ============= Scenario 3: Order Query =============

class OrderQuery extends QueryObject<Order> {
    public OrderQuery forCustomer(String customerId) {
        criteria.put("customer_id", customerId);
        return this;
    }

    public OrderQuery dateRange(String start, String end) {
        criteria.put("date_start", start);
        criteria.put("date_end", end);
        return this;
    }

    public OrderQuery withStatus(String status) {
        criteria.put("status", status);
        return this;
    }

    public OrderQuery minimumAmount(double amount) {
        criteria.put("min_amount", amount);
        return this;
    }

    public OrderQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    public OrderQuery limit(int limit) {
        this.limitValue = limit;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM orders" + buildWhereClause() + buildOrderByClause() + buildLimitClause();
    }
}

class Order {
    String id, customerId, status, orderDate;
    double amount;

    public Order(String customerId, double amount, String status) {
        this.id = "ORD" + System.currentTimeMillis();
        this.customerId = customerId;
        this.amount = amount;
        this.status = status;
        this.orderDate = "2024-10-14";
    }

    @Override
    public String toString() {
        return id + " - $" + amount + " [" + status + "]";
    }
}

class OrderRepository {
    private List<Order> orders = Arrays.asList(
        new Order("CUST-123", 150.50, "COMPLETED"),
        new Order("CUST-123", 89.99, "COMPLETED"),
        new Order("CUST-123", 250.00, "COMPLETED")
    );

    public List<Order> find(OrderQuery query) {
        return orders.stream()
            .filter(o -> query.criteria.isEmpty() ||
                   o.customerId.equals(query.criteria.get("customer_id")))
            .limit(query.limitValue != null ? query.limitValue : orders.size())
            .collect(Collectors.toList());
    }
}

// ============= Scenario 4: Employee Query =============

class EmployeeQuery extends QueryObject<Employee> {
    public EmployeeQuery inDepartment(String department) {
        criteria.put("department", department);
        return this;
    }

    public EmployeeQuery withSkills(List<String> skills) {
        criteria.put("skills", skills);
        return this;
    }

    public EmployeeQuery salaryRange(double min, double max) {
        criteria.put("salary_min", min);
        criteria.put("salary_max", max);
        return this;
    }

    public EmployeeQuery availableForProject(boolean available) {
        criteria.put("available", available);
        return this;
    }

    public EmployeeQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM employees" + buildWhereClause() + buildOrderByClause();
    }
}

class Employee {
    String id, name, department;
    double salary;
    List<String> skills;

    public Employee(String name, String department, double salary, List<String> skills) {
        this.id = "EMP" + System.currentTimeMillis();
        this.name = name;
        this.department = department;
        this.salary = salary;
        this.skills = skills;
    }

    @Override
    public String toString() {
        return name + " - " + department + " (" + String.join(", ", skills) + ")";
    }
}

class EmployeeRepository {
    private List<Employee> employees = Arrays.asList(
        new Employee("Alice Smith", "Engineering", 120000, Arrays.asList("Java", "Spring", "Kubernetes")),
        new Employee("Bob Jones", "Engineering", 95000, Arrays.asList("Java", "React", "AWS"))
    );

    public List<Employee> find(EmployeeQuery query) {
        return employees.stream()
            .filter(e -> query.criteria.isEmpty() ||
                   e.department.equals(query.criteria.get("department")))
            .collect(Collectors.toList());
    }
}

// ============= Additional Repository Implementations =============

class TransactionQuery extends QueryObject<Transaction> {
    public TransactionQuery forAccount(String accountId) {
        criteria.put("account_id", accountId);
        return this;
    }

    public TransactionQuery transactionType(String type) {
        criteria.put("type", type);
        return this;
    }

    public TransactionQuery amountGreaterThan(double amount) {
        criteria.put("min_amount", amount);
        return this;
    }

    public TransactionQuery dateRange(String start, String end) {
        criteria.put("date_start", start);
        criteria.put("date_end", end);
        return this;
    }

    public TransactionQuery withCategory(String category) {
        criteria.put("category", category);
        return this;
    }

    public TransactionQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM transactions" + buildWhereClause() + buildOrderByClause();
    }
}

class Transaction {
    String id, accountId, type, category;
    double amount;

    public Transaction(String accountId, String type, double amount, String category) {
        this.id = "TXN" + System.currentTimeMillis();
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.category = category;
    }

    @Override
    public String toString() {
        return id + " - " + type + " $" + amount + " [" + category + "]";
    }
}

class TransactionRepository {
    private List<Transaction> transactions = Arrays.asList(
        new Transaction("ACC-789", "DEBIT", 1500.00, "TRANSFER"),
        new Transaction("ACC-789", "DEBIT", 2500.00, "TRANSFER")
    );

    public List<Transaction> find(TransactionQuery query) {
        return transactions.stream()
            .filter(t -> query.criteria.isEmpty() || matchesCriteria(t, query))
            .collect(Collectors.toList());
    }

    private boolean matchesCriteria(Transaction t, TransactionQuery query) {
        return t.accountId.equals(query.criteria.get("account_id"));
    }
}

class CustomerQuery extends QueryObject<Customer> {
    public CustomerQuery lifetimeValueGreaterThan(double value) {
        criteria.put("min_ltv", value);
        return this;
    }

    public CustomerQuery purchaseCountGreaterThan(int count) {
        criteria.put("min_purchases", count);
        return this;
    }

    public CustomerQuery lastPurchaseWithin(int days) {
        criteria.put("last_purchase_days", days);
        return this;
    }

    public CustomerQuery inRegion(String region) {
        criteria.put("region", region);
        return this;
    }

    public CustomerQuery withLoyaltyTier(String tier) {
        criteria.put("loyalty_tier", tier);
        return this;
    }

    public CustomerQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    public CustomerQuery limit(int limit) {
        this.limitValue = limit;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM customers" + buildWhereClause() + buildOrderByClause() + buildLimitClause();
    }
}

class Customer {
    String id, name, region, loyaltyTier;
    double lifetimeValue;
    int purchaseCount;

    public Customer(String name, String region, double ltv, int purchases, String tier) {
        this.id = "C" + System.currentTimeMillis();
        this.name = name;
        this.region = region;
        this.lifetimeValue = ltv;
        this.purchaseCount = purchases;
        this.loyaltyTier = tier;
    }

    @Override
    public String toString() {
        return name + " - $" + lifetimeValue + " LTV [" + loyaltyTier + "]";
    }
}

class CustomerRepository {
    private List<Customer> customers = Arrays.asList(
        new Customer("John Doe", "North America", 15000, 25, "GOLD"),
        new Customer("Jane Smith", "North America", 22000, 35, "GOLD")
    );

    public List<Customer> find(CustomerQuery query) {
        return customers.stream()
            .filter(c -> query.criteria.isEmpty() ||
                   c.region.equals(query.criteria.get("region")))
            .limit(query.limitValue != null ? query.limitValue : customers.size())
            .collect(Collectors.toList());
    }
}

class InventoryQuery extends QueryObject<InventoryItem> {
    public InventoryQuery inWarehouse(String warehouseId) {
        criteria.put("warehouse_id", warehouseId);
        return this;
    }

    public InventoryQuery stockLevelBelow(int level) {
        criteria.put("max_stock", level);
        return this;
    }

    public InventoryQuery withReorderPoint(boolean needsReorder) {
        criteria.put("needs_reorder", needsReorder);
        return this;
    }

    public InventoryQuery inCategories(List<String> categories) {
        criteria.put("categories", categories);
        return this;
    }

    public InventoryQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM inventory" + buildWhereClause() + buildOrderByClause();
    }
}

class InventoryItem {
    String id, sku, category, warehouse;
    int stockLevel, reorderPoint;

    public InventoryItem(String sku, String category, int stock, int reorder) {
        this.id = "INV" + System.currentTimeMillis();
        this.sku = sku;
        this.category = category;
        this.stockLevel = stock;
        this.reorderPoint = reorder;
        this.warehouse = "WH-01";
    }

    @Override
    public String toString() {
        return sku + " - Stock: " + stockLevel + " (Reorder at: " + reorderPoint + ")";
    }
}

class InventoryRepository {
    private List<InventoryItem> items = Arrays.asList(
        new InventoryItem("ELEC-001", "Electronics", 5, 10),
        new InventoryItem("ELEC-002", "Electronics", 3, 10),
        new InventoryItem("ACC-001", "Accessories", 8, 15)
    );

    public List<InventoryItem> find(InventoryQuery query) {
        return items.stream()
            .filter(i -> i.warehouse.equals(query.criteria.get("warehouse_id")))
            .collect(Collectors.toList());
    }
}

class LogQuery extends QueryObject<LogEntry> {
    public LogQuery withSeverity(String severity) {
        criteria.put("severity", severity);
        return this;
    }

    public LogQuery fromService(String service) {
        criteria.put("service", service);
        return this;
    }

    public LogQuery dateRange(String start, String end) {
        criteria.put("timestamp_start", start);
        criteria.put("timestamp_end", end);
        return this;
    }

    public LogQuery containingText(String text) {
        criteria.put("message_contains", text);
        return this;
    }

    public LogQuery excludeUser(String user) {
        criteria.put("exclude_user", user);
        return this;
    }

    public LogQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    public LogQuery limit(int limit) {
        this.limitValue = limit;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM logs" + buildWhereClause() + buildOrderByClause() + buildLimitClause();
    }
}

class LogEntry {
    String id, service, severity, message, timestamp;

    public LogEntry(String service, String severity, String message) {
        this.id = "LOG" + System.currentTimeMillis();
        this.service = service;
        this.severity = severity;
        this.message = message;
        this.timestamp = "2024-10-14 10:30:00";
    }

    @Override
    public String toString() {
        return "[" + severity + "] " + service + ": " + message;
    }
}

class LogRepository {
    private List<LogEntry> logs = Arrays.asList(
        new LogEntry("payment-service", "ERROR", "Connection timeout to payment gateway"),
        new LogEntry("payment-service", "ERROR", "Transaction timeout after 30s")
    );

    public List<LogEntry> find(LogQuery query) {
        return logs.stream()
            .filter(l -> l.service.equals(query.criteria.get("service")))
            .limit(query.limitValue != null ? query.limitValue : logs.size())
            .collect(Collectors.toList());
    }
}

class SalesQuery extends QueryObject<SalesData> {
    public SalesQuery dateRange(String start, String end) {
        criteria.put("date_start", start);
        criteria.put("date_end", end);
        return this;
    }

    public SalesQuery byRegion(String region) {
        criteria.put("region", region);
        return this;
    }

    public SalesQuery byProductCategory(String category) {
        criteria.put("product_category", category);
        return this;
    }

    public SalesQuery groupBy(String field) {
        criteria.put("group_by", field);
        return this;
    }

    public SalesQuery having(String field, String operator, double value) {
        criteria.put("having_field", field);
        criteria.put("having_op", operator);
        criteria.put("having_value", value);
        return this;
    }

    public SalesQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    @Override
    public String toSql() {
        String sql = "SELECT region, SUM(amount) as totalSales FROM sales" + buildWhereClause();
        if (criteria.containsKey("group_by")) {
            sql += " GROUP BY " + criteria.get("group_by");
        }
        sql += buildOrderByClause();
        return sql;
    }
}

class SalesData {
    String period, region, category;
    double totalSales;

    public SalesData(String period, String region, double total) {
        this.period = period;
        this.region = region;
        this.totalSales = total;
    }

    @Override
    public String toString() {
        return period + " - " + region + ": $" + totalSales;
    }
}

class SalesRepository {
    private List<SalesData> sales = Arrays.asList(
        new SalesData("2024-Q1", "West", 125000),
        new SalesData("2024-Q2", "West", 145000)
    );

    public List<SalesData> find(SalesQuery query) {
        return sales;
    }
}

class PropertyQuery extends QueryObject<Property> {
    public PropertyQuery inCity(String city) {
        criteria.put("city", city);
        return this;
    }

    public PropertyQuery priceRange(double min, double max) {
        criteria.put("price_min", min);
        criteria.put("price_max", max);
        return this;
    }

    public PropertyQuery minBedrooms(int bedrooms) {
        criteria.put("min_bedrooms", bedrooms);
        return this;
    }

    public PropertyQuery minBathrooms(int bathrooms) {
        criteria.put("min_bathrooms", bathrooms);
        return this;
    }

    public PropertyQuery withFeatures(List<String> features) {
        criteria.put("features", features);
        return this;
    }

    public PropertyQuery nearTransit(double miles) {
        criteria.put("transit_distance", miles);
        return this;
    }

    public PropertyQuery availableForSale() {
        criteria.put("status", "FOR_SALE");
        return this;
    }

    public PropertyQuery sortBy(String field, String order) {
        this.sortField = field;
        this.sortOrder = order;
        return this;
    }

    public PropertyQuery limit(int limit) {
        this.limitValue = limit;
        return this;
    }

    @Override
    public String toSql() {
        return "SELECT * FROM properties" + buildWhereClause() + buildOrderByClause() + buildLimitClause();
    }
}

class Property {
    String id, address, city, status;
    double price;
    int bedrooms, bathrooms;

    public Property(String address, String city, double price, int bed, int bath) {
        this.id = "PROP" + System.currentTimeMillis();
        this.address = address;
        this.city = city;
        this.price = price;
        this.bedrooms = bed;
        this.bathrooms = bath;
        this.status = "FOR_SALE";
    }

    @Override
    public String toString() {
        return address + " - $" + price + " (" + bedrooms + "bd/" + bathrooms + "ba)";
    }
}

class PropertyRepository {
    private List<Property> properties = Arrays.asList(
        new Property("123 Main St", "San Francisco", 950000, 2, 2),
        new Property("456 Oak Ave", "San Francisco", 1200000, 3, 2)
    );

    public List<Property> find(PropertyQuery query) {
        return properties.stream()
            .filter(p -> p.city.equals(query.criteria.get("city")))
            .limit(query.limitValue != null ? query.limitValue : properties.size())
            .collect(Collectors.toList());
    }
}
