package Enterprise.DataMapper;

import java.sql.*;
import java.util.*;
import java.math.BigDecimal;

/**
 * DataMapper Pattern Demonstration
 *
 * The Data Mapper pattern acts as a mediator between domain objects and the database,
 * keeping them independent of each other and the mapper itself. Unlike Active Record,
 * domain objects have no knowledge of the database.
 *
 * Key Concepts:
 * - Separation of concerns: domain logic and data access
 * - Domain objects are POJOs with no database dependencies
 * - Mapper handles all SQL and data conversion
 * - Enables testability without database
 *
 * Advantages:
 * - Complete separation between domain and persistence
 * - Domain objects are easily testable
 * - Can support complex domain models
 * - Flexible persistence strategies
 *
 * Disadvantages:
 * - More code than Active Record
 * - Additional layer of indirection
 * - Can be over-engineering for simple cases
 *
 * Real-world use cases:
 * - Enterprise applications with complex domain logic
 * - Systems requiring database independence
 * - Domain-Driven Design implementations
 * - Applications requiring extensive unit testing
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DataMapper Pattern Demo ===\n");

        demonstrateBasicMapping();
        demonstrateSeparationOfConcerns();
        demonstrateComplexDomainLogic();
        demonstrateRelationshipMapping();
        demonstrateIdentityMapping();
        demonstrateLazyLoading();
        demonstrateUnitOfWork();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates basic data mapping operations.
     */
    private static void demonstrateBasicMapping() {
        System.out.println("--- Basic Data Mapping ---");

        // Create mapper
        CustomerMapper mapper = new CustomerMapper();

        // Create domain object (POJO)
        Customer customer = new Customer();
        customer.setId(null);
        customer.setName("John Doe");
        customer.setEmail("john.doe@example.com");
        customer.setPhone("555-1234");

        // Insert using mapper
        mapper.insert(customer);
        System.out.println("Inserted customer: " + customer.getName() + " (ID: " + customer.getId() + ")");

        // Find by ID
        Customer loaded = mapper.findById(customer.getId());
        System.out.println("Loaded customer: " + loaded.getName());

        // Update
        loaded.setEmail("john.new@example.com");
        mapper.update(loaded);
        System.out.println("Updated customer email: " + loaded.getEmail());

        System.out.println("Basic mapping operations complete");
    }

    /**
     * Demonstrates separation of concerns between domain and persistence.
     */
    private static void demonstrateSeparationOfConcerns() {
        System.out.println("\n--- Separation of Concerns ---");

        // Domain object knows nothing about database
        Order order = new Order();
        order.setCustomerId(1L);
        order.setOrderDate(new Date());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(new BigDecimal("299.99"));

        // Add line items (domain logic)
        OrderLineItem item1 = new OrderLineItem();
        item1.setProductId(101L);
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("49.99"));
        order.addLineItem(item1);

        OrderLineItem item2 = new OrderLineItem();
        item2.setProductId(102L);
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("199.99"));
        order.addLineItem(item2);

        // Calculate total (pure domain logic)
        order.calculateTotal();
        System.out.println("Order total: $" + order.getTotalAmount());

        // Mapper handles all persistence
        OrderMapper orderMapper = new OrderMapper();
        orderMapper.insert(order);
        System.out.println("Order saved via mapper (ID: " + order.getId() + ")");

        // Domain object can be tested without database
        Order testOrder = new Order();
        testOrder.setTotalAmount(new BigDecimal("100.00"));
        testOrder.applyDiscount(new BigDecimal("10.00"));
        System.out.println("Test order after discount: $" + testOrder.getTotalAmount() + " (no database needed)");
    }

    /**
     * Demonstrates complex domain logic without database coupling.
     */
    private static void demonstrateComplexDomainLogic() {
        System.out.println("\n--- Complex Domain Logic ---");

        // Rich domain model
        ShoppingCart cart = new ShoppingCart();
        cart.setCustomerId(1L);

        // Add products
        Product product1 = new Product(1L, "Laptop", new BigDecimal("999.99"), "ELECTRONICS");
        Product product2 = new Product(2L, "Mouse", new BigDecimal("29.99"), "ACCESSORIES");
        Product product3 = new Product(3L, "Keyboard", new BigDecimal("79.99"), "ACCESSORIES");

        cart.addProduct(product1, 1);
        cart.addProduct(product2, 2);
        cart.addProduct(product3, 1);

        // Apply business rules
        cart.applyBulkDiscount(); // 10% off if cart > $500
        cart.applyCategoryDiscount("ACCESSORIES", new BigDecimal("5.00")); // $5 off accessories

        System.out.println("Cart subtotal: $" + cart.getSubtotal());
        System.out.println("Cart discounts: $" + cart.getTotalDiscounts());
        System.out.println("Cart total: $" + cart.getTotal());

        // Validate cart (domain logic)
        List<String> validation = cart.validate();
        if (validation.isEmpty()) {
            System.out.println("Cart is valid");
        } else {
            System.out.println("Cart validation errors: " + validation);
        }

        // Save through mapper
        ShoppingCartMapper cartMapper = new ShoppingCartMapper();
        cartMapper.save(cart);
        System.out.println("Cart saved via mapper");
    }

    /**
     * Demonstrates mapping of object relationships.
     */
    private static void demonstrateRelationshipMapping() {
        System.out.println("\n--- Relationship Mapping ---");

        CustomerMapper customerMapper = new CustomerMapper();
        OrderMapper orderMapper = new OrderMapper();

        // Load customer
        Customer customer = customerMapper.findById(1L);
        System.out.println("Customer: " + customer.getName());

        // Load customer's orders (one-to-many)
        List<Order> orders = orderMapper.findByCustomerId(customer.getId());
        System.out.println("Customer has " + orders.size() + " orders");

        // Load order with customer (many-to-one)
        if (!orders.isEmpty()) {
            Order order = orders.get(0);
            Customer orderCustomer = customerMapper.findById(order.getCustomerId());
            System.out.println("Order " + order.getId() + " belongs to: " + orderCustomer.getName());
        }

        // Many-to-many relationship
        ProductMapper productMapper = new ProductMapper();
        CategoryMapper categoryMapper = new CategoryMapper();

        Product product = productMapper.findById(1L);
        List<Category> categories = categoryMapper.findByProductId(product.getId());
        System.out.println("Product " + product.getName() + " is in " + categories.size() + " categories");
    }

    /**
     * Demonstrates Identity Map pattern with Data Mapper.
     */
    private static void demonstrateIdentityMapping() {
        System.out.println("\n--- Identity Map ---");

        // Create mapper with identity map
        CustomerMapper mapper = new CustomerMapper();

        // First load
        Customer customer1 = mapper.findById(1L);
        System.out.println("First load: " + customer1.getName() + " (@" + System.identityHashCode(customer1) + ")");

        // Second load (same ID)
        Customer customer2 = mapper.findById(1L);
        System.out.println("Second load: " + customer2.getName() + " (@" + System.identityHashCode(customer2) + ")");

        // Check if same instance (Identity Map ensures this)
        boolean sameInstance = (customer1 == customer2);
        System.out.println("Same instance: " + sameInstance);

        // Clear identity map
        mapper.clearIdentityMap();
        Customer customer3 = mapper.findById(1L);
        System.out.println("After clear: " + customer3.getName() + " (@" + System.identityHashCode(customer3) + ")");
        System.out.println("Same as first: " + (customer1 == customer3));
    }

    /**
     * Demonstrates lazy loading of relationships.
     */
    private static void demonstrateLazyLoading() {
        System.out.println("\n--- Lazy Loading ---");

        CustomerMapper mapper = new CustomerMapper();
        Customer customer = mapper.findById(1L);
        System.out.println("Loaded customer: " + customer.getName());

        // Orders not loaded yet
        System.out.println("Orders loaded: " + (customer.getOrders() != null));

        // Lazy load orders
        OrderMapper orderMapper = new OrderMapper();
        List<Order> orders = orderMapper.findByCustomerId(customer.getId());
        customer.setOrders(orders);
        System.out.println("Orders lazy loaded: " + orders.size() + " orders");

        // Virtual proxy pattern for lazy loading
        CustomerWithProxy customerProxy = mapper.findByIdWithProxy(1L);
        System.out.println("Customer with proxy loaded");

        // Orders are loaded only when accessed
        System.out.println("Accessing orders triggers lazy load...");
        List<Order> lazyOrders = customerProxy.getOrders();
        System.out.println("Lazy loaded " + lazyOrders.size() + " orders");
    }

    /**
     * Demonstrates Unit of Work pattern with Data Mapper.
     */
    private static void demonstrateUnitOfWork() {
        System.out.println("\n--- Unit of Work Pattern ---");

        UnitOfWork unitOfWork = new UnitOfWork();
        CustomerMapper customerMapper = new CustomerMapper();
        OrderMapper orderMapper = new OrderMapper();

        // Register new objects
        Customer newCustomer = new Customer();
        newCustomer.setName("Alice Johnson");
        newCustomer.setEmail("alice@example.com");
        unitOfWork.registerNew(newCustomer, customerMapper);

        // Register modified objects
        Customer existingCustomer = customerMapper.findById(1L);
        existingCustomer.setEmail("updated@example.com");
        unitOfWork.registerDirty(existingCustomer, customerMapper);

        // Register removed objects
        Customer toDelete = customerMapper.findById(2L);
        if (toDelete != null) {
            unitOfWork.registerDeleted(toDelete, customerMapper);
        }

        System.out.println("Registered operations in Unit of Work");
        System.out.println("  New: 1 customer");
        System.out.println("  Modified: 1 customer");
        System.out.println("  Deleted: " + (toDelete != null ? "1" : "0") + " customer");

        // Commit all changes in one transaction
        unitOfWork.commit();
        System.out.println("Unit of Work committed successfully");
    }

    /**
     * Demonstrates real-world scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        System.out.println("\n1. E-commerce Order Processing:");
        processEcommerceOrder();

        System.out.println("\n2. Complex Query with Specifications:");
        demonstrateQuerySpecifications();

        System.out.println("\n3. Aggregate Root Loading:");
        demonstrateAggregateRoot();

        System.out.println("\n4. Optimistic Locking:");
        demonstrateOptimisticLocking();

        System.out.println("\n5. Batch Operations:");
        demonstrateBatchOperations();
    }

    private static void processEcommerceOrder() {
        // Create domain objects
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setName("John Smith");
        customer.setEmail("john.smith@example.com");

        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setOrderDate(new Date());
        order.setStatus(OrderStatus.PENDING);

        // Add line items
        order.addLineItem(createLineItem(1L, 2, new BigDecimal("49.99")));
        order.addLineItem(createLineItem(2L, 1, new BigDecimal("99.99")));

        // Calculate total (domain logic)
        order.calculateTotal();
        order.applyDiscount(new BigDecimal("15.00"));

        System.out.println("   Order created with " + order.getLineItems().size() + " items");
        System.out.println("   Total: $" + order.getTotalAmount());

        // Save using mapper
        OrderMapper mapper = new OrderMapper();
        mapper.insert(order);
        System.out.println("   Order saved (ID: " + order.getId() + ")");

        // Update order status (domain logic)
        order.markAsPaid();
        mapper.update(order);
        System.out.println("   Order status: " + order.getStatus());
    }

    private static OrderLineItem createLineItem(Long productId, int quantity, BigDecimal price) {
        OrderLineItem item = new OrderLineItem();
        item.setProductId(productId);
        item.setQuantity(quantity);
        item.setUnitPrice(price);
        return item;
    }

    private static void demonstrateQuerySpecifications() {
        CustomerMapper mapper = new CustomerMapper();

        // Specification pattern for complex queries
        CustomerSpecification spec = new CustomerSpecification();
        spec.withStatus("ACTIVE");
        spec.withEmailDomain("example.com");
        spec.withMinOrderCount(5);
        spec.orderByName();

        List<Customer> customers = mapper.findBySpecification(spec);
        System.out.println("   Found " + customers.size() + " customers matching specification");

        // Alternative: Query Object pattern
        CustomerQuery query = new CustomerQuery();
        query.whereStatusEquals("ACTIVE");
        query.whereEmailContains("@example.com");
        query.orderBy("created_at", "DESC");
        query.limit(10);

        List<Customer> queryResults = mapper.executeQuery(query);
        System.out.println("   Query returned " + queryResults.size() + " customers");
    }

    private static void demonstrateAggregateRoot() {
        OrderMapper mapper = new OrderMapper();

        // Load aggregate root with all associated objects
        Order order = mapper.findByIdWithDetails(1L);
        System.out.println("   Loaded order aggregate:");
        System.out.println("     Order ID: " + order.getId());
        System.out.println("     Line items: " + order.getLineItems().size());
        System.out.println("     Customer: " + (order.getCustomer() != null ? order.getCustomer().getName() : "N/A"));

        // Modify aggregate
        order.addLineItem(createLineItem(3L, 1, new BigDecimal("29.99")));
        order.calculateTotal();

        // Save entire aggregate
        mapper.saveAggregate(order);
        System.out.println("   Aggregate saved with all associations");
    }

    private static void demonstrateOptimisticLocking() {
        CustomerMapper mapper = new CustomerMapper();

        // Load customer (includes version number)
        Customer customer1 = mapper.findById(1L);
        Long version1 = customer1.getVersion();
        System.out.println("   Customer loaded (version: " + version1 + ")");

        // Simulate concurrent access
        Customer customer2 = mapper.findById(1L);
        customer2.setEmail("concurrent@example.com");
        mapper.update(customer2); // Updates version to 2
        System.out.println("   Concurrent update successful (version: " + customer2.getVersion() + ")");

        // Try to update original (should detect version conflict)
        customer1.setEmail("original@example.com");
        try {
            mapper.update(customer1);
            System.out.println("   Original update successful");
        } catch (OptimisticLockException e) {
            System.out.println("   Original update failed: " + e.getMessage());
            System.out.println("   Version conflict detected");
        }
    }

    private static void demonstrateBatchOperations() {
        CustomerMapper mapper = new CustomerMapper();

        // Batch insert
        List<Customer> customers = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            Customer customer = new Customer();
            customer.setName("Batch Customer " + i);
            customer.setEmail("batch" + i + "@example.com");
            customers.add(customer);
        }

        int inserted = mapper.batchInsert(customers);
        System.out.println("   Batch inserted " + inserted + " customers");

        // Batch update
        for (Customer customer : customers) {
            customer.setStatus("VERIFIED");
        }
        int updated = mapper.batchUpdate(customers);
        System.out.println("   Batch updated " + updated + " customers");

        // Batch delete
        List<Long> idsToDelete = customers.stream()
                .map(Customer::getId)
                .limit(10)
                .toList();
        int deleted = mapper.batchDelete(idsToDelete);
        System.out.println("   Batch deleted " + deleted + " customers");
    }
}
