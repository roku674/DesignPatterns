package Enterprise.UnitOfWork;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * UnitOfWork Pattern Demonstration
 *
 * The UnitOfWork pattern maintains a list of objects affected by a business transaction
 * and coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * Real-world Use Cases:
 * - E-commerce order processing with inventory updates
 * - Banking transactions affecting multiple accounts
 * - Multi-entity data operations requiring atomic commits
 * - Complex business workflows with rollback capabilities
 *
 * Benefits:
 * - Tracks all changes during a business transaction
 * - Ensures atomic commits (all or nothing)
 * - Optimizes database operations by batching
 * - Prevents duplicate updates
 * - Provides transaction rollback capabilities
 *
 * @author Enterprise Patterns Implementation
 * @version 2.0
 */
public class Main {

    /**
     * Main entry point demonstrating comprehensive UnitOfWork scenarios.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("UnitOfWork Pattern - Enterprise E-Commerce System");
        System.out.println("=".repeat(80));
        System.out.println();

        // Scenario 1: Basic order creation with product updates
        demonstrateBasicOrderCreation();

        // Scenario 2: Multiple entities in single transaction
        demonstrateMultiEntityTransaction();

        // Scenario 3: Transaction rollback on error
        demonstrateTransactionRollback();

        // Scenario 4: Optimistic concurrency control
        demonstrateOptimisticLocking();

        // Scenario 5: Batch operations optimization
        demonstrateBatchOperations();

        // Scenario 6: Nested unit of work
        demonstrateNestedUnitOfWork();

        // Scenario 7: Order with inventory management
        demonstrateOrderWithInventory();

        // Scenario 8: Complex business workflow
        demonstrateComplexWorkflow();

        // Scenario 9: Concurrent order processing
        demonstrateConcurrentProcessing();

        // Scenario 10: Transaction isolation levels
        demonstrateIsolationLevels();

        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("All UnitOfWork scenarios completed successfully!");
        System.out.println("=".repeat(80));
    }

    /**
     * Scenario 1: Demonstrates basic order creation with product inventory updates.
     * Shows how multiple related entities are tracked and committed atomically.
     */
    private static void demonstrateBasicOrderCreation() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 1: Basic Order Creation with Product Updates");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();

        try {
            // Create customer
            Customer customer = new Customer(1L, "John Doe", "john@example.com");
            uow.registerNew(customer);

            // Create order
            Order order = new Order(101L, customer.getId(), LocalDateTime.now());
            uow.registerNew(order);

            // Add order items
            Product laptop = new Product(1L, "Laptop", new BigDecimal("999.99"), 10);
            OrderItem item1 = new OrderItem(1L, order.getId(), laptop.getId(), 2, laptop.getPrice());
            uow.registerNew(item1);

            // Update product inventory
            laptop.setStockQuantity(laptop.getStockQuantity() - 2);
            uow.registerDirty(laptop);

            System.out.println("Before commit:");
            System.out.println("  New entities: " + uow.getNewEntities().size());
            System.out.println("  Modified entities: " + uow.getDirtyEntities().size());

            // Commit all changes
            uow.commit();

            System.out.println("\nAfter commit:");
            System.out.println("  Order #" + order.getId() + " created for " + customer.getName());
            System.out.println("  Laptop inventory updated: " + laptop.getStockQuantity() + " remaining");
            System.out.println("  Transaction completed successfully!");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            uow.rollback();
        }
    }

    /**
     * Scenario 2: Demonstrates handling multiple different entity types
     * in a single cohesive transaction.
     */
    private static void demonstrateMultiEntityTransaction() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 2: Multi-Entity Transaction");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();

        try {
            // Create multiple related entities
            Customer customer = new Customer(2L, "Jane Smith", "jane@example.com");
            Address shippingAddress = new Address(1L, customer.getId(), "123 Main St", "New York", "NY", "10001");
            PaymentMethod payment = new PaymentMethod(1L, customer.getId(), "Credit Card", "****1234");

            uow.registerNew(customer);
            uow.registerNew(shippingAddress);
            uow.registerNew(payment);

            // Create order with all relationships
            Order order = new Order(102L, customer.getId(), LocalDateTime.now());
            order.setShippingAddressId(shippingAddress.getId());
            order.setPaymentMethodId(payment.getId());
            uow.registerNew(order);

            System.out.println("Registering 4 entities in transaction:");
            System.out.println("  - Customer: " + customer.getName());
            System.out.println("  - Address: " + shippingAddress.getCity());
            System.out.println("  - Payment: " + payment.getType());
            System.out.println("  - Order: #" + order.getId());

            uow.commit();

            System.out.println("\nAll entities committed atomically!");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            uow.rollback();
        }
    }

    /**
     * Scenario 3: Demonstrates automatic rollback when an error occurs
     * during transaction processing.
     */
    private static void demonstrateTransactionRollback() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 3: Transaction Rollback on Error");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();

        try {
            Customer customer = new Customer(3L, "Bob Johnson", "bob@example.com");
            uow.registerNew(customer);

            Order order = new Order(103L, customer.getId(), LocalDateTime.now());
            uow.registerNew(order);

            // Simulate an error condition
            Product outOfStock = new Product(2L, "Mouse", new BigDecimal("29.99"), 0);
            OrderItem item = new OrderItem(2L, order.getId(), outOfStock.getId(), 5, outOfStock.getPrice());

            if (outOfStock.getStockQuantity() < item.getQuantity()) {
                throw new InsufficientInventoryException(
                    "Cannot create order: Product " + outOfStock.getName() + " is out of stock"
                );
            }

            uow.commit();

        } catch (InsufficientInventoryException e) {
            System.out.println("Error detected: " + e.getMessage());
            System.out.println("Rolling back transaction...");
            uow.rollback();
            System.out.println("All changes reverted successfully!");
            System.out.println("No partial data was persisted.");
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            uow.rollback();
        }
    }

    /**
     * Scenario 4: Demonstrates optimistic locking to handle concurrent modifications.
     */
    private static void demonstrateOptimisticLocking() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 4: Optimistic Concurrency Control");
        System.out.println("-".repeat(80));

        UnitOfWork uow1 = new UnitOfWork();
        UnitOfWork uow2 = new UnitOfWork();

        try {
            // Simulate two concurrent transactions modifying same product
            Product product = new Product(3L, "Keyboard", new BigDecimal("79.99"), 20);
            product.setVersion(1);

            System.out.println("Initial state: " + product.getName() + " (version " + product.getVersion() + ", stock: " + product.getStockQuantity() + ")");

            // First transaction
            Product product1 = product.clone();
            product1.setStockQuantity(15);
            uow1.registerDirty(product1);

            // Second transaction (concurrent)
            Product product2 = product.clone();
            product2.setStockQuantity(18);
            uow2.registerDirty(product2);

            // First commit succeeds
            System.out.println("\nTransaction 1 committing...");
            uow1.commit();
            System.out.println("Transaction 1 committed (new stock: " + product1.getStockQuantity() + ", version: " + product1.getVersion() + ")");

            // Second commit detects conflict
            System.out.println("\nTransaction 2 committing...");
            try {
                uow2.commit();
            } catch (ConcurrentModificationException e) {
                System.out.println("Conflict detected: " + e.getMessage());
                System.out.println("Transaction 2 must retry with updated version");
                uow2.rollback();
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    /**
     * Scenario 5: Demonstrates batch operation optimization to reduce
     * database round trips.
     */
    private static void demonstrateBatchOperations() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 5: Batch Operations Optimization");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();

        try {
            System.out.println("Creating bulk order with multiple items...");

            Customer customer = new Customer(4L, "Alice Brown", "alice@example.com");
            uow.registerNew(customer);

            Order order = new Order(104L, customer.getId(), LocalDateTime.now());
            uow.registerNew(order);

            // Add multiple items
            for (int i = 1; i <= 5; i++) {
                Product product = new Product((long) i, "Product " + i, new BigDecimal("10.00").multiply(new BigDecimal(i)), 100);
                OrderItem item = new OrderItem((long) i, order.getId(), product.getId(), 2, product.getPrice());
                uow.registerNew(item);

                product.setStockQuantity(product.getStockQuantity() - 2);
                uow.registerDirty(product);
            }

            System.out.println("Entities registered:");
            System.out.println("  New: " + uow.getNewEntities().size());
            System.out.println("  Modified: " + uow.getDirtyEntities().size());

            long startTime = System.nanoTime();
            uow.commit();
            long endTime = System.nanoTime();

            System.out.println("\nBatch commit completed in " + (endTime - startTime) / 1_000_000 + "ms");
            System.out.println("Optimized: All inserts and updates batched together!");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            uow.rollback();
        }
    }

    /**
     * Scenario 6: Demonstrates nested unit of work for complex operations.
     */
    private static void demonstrateNestedUnitOfWork() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 6: Nested Unit of Work");
        System.out.println("-".repeat(80));

        UnitOfWork parentUow = new UnitOfWork();

        try {
            Customer customer = new Customer(5L, "Charlie Wilson", "charlie@example.com");
            parentUow.registerNew(customer);

            // Nested transaction for order processing
            UnitOfWork childUow = new UnitOfWork(parentUow);

            Order order = new Order(105L, customer.getId(), LocalDateTime.now());
            childUow.registerNew(order);

            Product product = new Product(4L, "Monitor", new BigDecimal("299.99"), 5);
            OrderItem item = new OrderItem(3L, order.getId(), product.getId(), 1, product.getPrice());
            childUow.registerNew(item);

            System.out.println("Parent UoW entities: " + parentUow.getNewEntities().size());
            System.out.println("Child UoW entities: " + childUow.getNewEntities().size());

            // Commit child first
            childUow.commit();
            System.out.println("Child transaction committed");

            // Then commit parent
            parentUow.commit();
            System.out.println("Parent transaction committed");
            System.out.println("Nested transactions completed successfully!");

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            parentUow.rollback();
        }
    }

    /**
     * Scenario 7: Demonstrates order processing with real-time inventory management.
     */
    private static void demonstrateOrderWithInventory() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 7: Order with Inventory Management");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();
        InventoryManager inventoryManager = new InventoryManager();

        try {
            Customer customer = new Customer(6L, "Diana Prince", "diana@example.com");
            uow.registerNew(customer);

            Order order = new Order(106L, customer.getId(), LocalDateTime.now());
            uow.registerNew(order);

            // Check and reserve inventory
            Product tablet = new Product(5L, "Tablet", new BigDecimal("499.99"), 8);
            int requestedQty = 3;

            System.out.println("Checking inventory for " + tablet.getName());
            System.out.println("  Available: " + tablet.getStockQuantity());
            System.out.println("  Requested: " + requestedQty);

            if (inventoryManager.reserveInventory(tablet, requestedQty)) {
                OrderItem item = new OrderItem(4L, order.getId(), tablet.getId(), requestedQty, tablet.getPrice());
                uow.registerNew(item);

                tablet.setStockQuantity(tablet.getStockQuantity() - requestedQty);
                uow.registerDirty(tablet);

                order.setTotal(tablet.getPrice().multiply(new BigDecimal(requestedQty)));

                System.out.println("\nInventory reserved successfully");
                System.out.println("  New stock level: " + tablet.getStockQuantity());
                System.out.println("  Order total: $" + order.getTotal());

                uow.commit();
                System.out.println("\nOrder completed and inventory updated!");
            }

        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            uow.rollback();
        }
    }

    /**
     * Scenario 8: Demonstrates complex business workflow with multiple steps.
     */
    private static void demonstrateComplexWorkflow() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 8: Complex Business Workflow");
        System.out.println("-".repeat(80));

        UnitOfWork uow = new UnitOfWork();

        try {
            // Step 1: Create customer and verify
            Customer customer = new Customer(7L, "Ethan Hunt", "ethan@example.com");
            uow.registerNew(customer);
            System.out.println("Step 1: Customer created - " + customer.getName());

            // Step 2: Set up payment method
            PaymentMethod payment = new PaymentMethod(2L, customer.getId(), "PayPal", "ethan@paypal.com");
            uow.registerNew(payment);
            System.out.println("Step 2: Payment method added - " + payment.getType());

            // Step 3: Create order
            Order order = new Order(107L, customer.getId(), LocalDateTime.now());
            order.setPaymentMethodId(payment.getId());
            uow.registerNew(order);
            System.out.println("Step 3: Order created - #" + order.getId());

            // Step 4: Add items and calculate total
            BigDecimal total = BigDecimal.ZERO;
            for (int i = 1; i <= 3; i++) {
                Product product = new Product((long) (5 + i), "Item " + i, new BigDecimal("50.00"), 20);
                OrderItem item = new OrderItem((long) (4 + i), order.getId(), product.getId(), 1, product.getPrice());
                uow.registerNew(item);
                total = total.add(product.getPrice());
            }
            order.setTotal(total);
            System.out.println("Step 4: Items added - Total: $" + total);

            // Step 5: Create shipment
            Shipment shipment = new Shipment(1L, order.getId(), "Standard", LocalDateTime.now().plusDays(3));
            uow.registerNew(shipment);
            System.out.println("Step 5: Shipment scheduled - " + shipment.getMethod());

            // Step 6: Update order status
            order.setStatus("PROCESSING");
            uow.registerDirty(order);
            System.out.println("Step 6: Order status updated - " + order.getStatus());

            // Commit entire workflow
            System.out.println("\nCommitting complex workflow...");
            uow.commit();
            System.out.println("Workflow completed successfully! All 6 steps committed atomically.");

        } catch (Exception e) {
            System.err.println("Workflow failed: " + e.getMessage());
            uow.rollback();
            System.out.println("All workflow steps rolled back");
        }
    }

    /**
     * Scenario 9: Demonstrates concurrent order processing with conflict resolution.
     */
    private static void demonstrateConcurrentProcessing() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 9: Concurrent Order Processing");
        System.out.println("-".repeat(80));

        Product sharedProduct = new Product(6L, "Limited Edition Item", new BigDecimal("199.99"), 5);
        sharedProduct.setVersion(1);

        System.out.println("Product: " + sharedProduct.getName());
        System.out.println("Initial stock: " + sharedProduct.getStockQuantity());
        System.out.println("\nSimulating 3 concurrent orders...\n");

        // Simulate three concurrent orders
        for (int i = 1; i <= 3; i++) {
            UnitOfWork uow = new UnitOfWork();
            try {
                Customer customer = new Customer((long) (7 + i), "Customer " + i, "customer" + i + "@example.com");
                Order order = new Order((long) (107 + i), customer.getId(), LocalDateTime.now());

                int requestedQty = 2;
                System.out.println("Order " + i + " requesting " + requestedQty + " units");

                if (sharedProduct.getStockQuantity() >= requestedQty) {
                    OrderItem item = new OrderItem((long) (7 + i), order.getId(), sharedProduct.getId(), requestedQty, sharedProduct.getPrice());
                    uow.registerNew(order);
                    uow.registerNew(item);

                    Product productCopy = sharedProduct.clone();
                    productCopy.setStockQuantity(productCopy.getStockQuantity() - requestedQty);
                    uow.registerDirty(productCopy);

                    uow.commit();
                    sharedProduct.setStockQuantity(productCopy.getStockQuantity());
                    sharedProduct.incrementVersion();

                    System.out.println("  Order " + i + " completed - Remaining stock: " + sharedProduct.getStockQuantity());
                } else {
                    System.out.println("  Order " + i + " failed - Insufficient stock");
                    uow.rollback();
                }
            } catch (Exception e) {
                System.out.println("  Order " + i + " error: " + e.getMessage());
                uow.rollback();
            }
        }

        System.out.println("\nFinal stock level: " + sharedProduct.getStockQuantity());
    }

    /**
     * Scenario 10: Demonstrates different transaction isolation levels.
     */
    private static void demonstrateIsolationLevels() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 10: Transaction Isolation Levels");
        System.out.println("-".repeat(80));

        // Read Committed
        System.out.println("\nIsolation Level: READ_COMMITTED");
        UnitOfWork uowReadCommitted = new UnitOfWork(IsolationLevel.READ_COMMITTED);
        try {
            Customer customer = new Customer(10L, "Frank Castle", "frank@example.com");
            uowReadCommitted.registerNew(customer);
            System.out.println("  Can read only committed data");
            System.out.println("  Prevents dirty reads");
            uowReadCommitted.commit();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }

        // Repeatable Read
        System.out.println("\nIsolation Level: REPEATABLE_READ");
        UnitOfWork uowRepeatableRead = new UnitOfWork(IsolationLevel.REPEATABLE_READ);
        try {
            Order order = new Order(110L, 10L, LocalDateTime.now());
            uowRepeatableRead.registerNew(order);
            System.out.println("  Prevents dirty reads and non-repeatable reads");
            System.out.println("  Same query returns same results");
            uowRepeatableRead.commit();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }

        // Serializable
        System.out.println("\nIsolation Level: SERIALIZABLE");
        UnitOfWork uowSerializable = new UnitOfWork(IsolationLevel.SERIALIZABLE);
        try {
            Product product = new Product(7L, "Premium Item", new BigDecimal("999.99"), 3);
            uowSerializable.registerNew(product);
            System.out.println("  Highest isolation level");
            System.out.println("  Prevents all anomalies (dirty, non-repeatable, phantom reads)");
            System.out.println("  Transactions execute as if serial");
            uowSerializable.commit();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }

        System.out.println("\nIsolation level demonstration completed!");
    }
}
