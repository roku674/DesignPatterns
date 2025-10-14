package Enterprise.ActiveRecord;

import java.sql.*;
import java.util.*;
import java.math.BigDecimal;

/**
 * ActiveRecord Pattern Demonstration
 *
 * The Active Record pattern is an approach to accessing data in a database where an object
 * wraps a database row and encapsulates both data access and domain logic. Each object
 * instance corresponds to a single database row.
 *
 * Key Concepts:
 * - Object wraps database row with domain logic
 * - CRUD operations are instance methods
 * - Direct coupling between object and database
 * - Simple pattern for simple domain logic
 *
 * Advantages:
 * - Simple and intuitive for developers
 * - Less code than Data Mapper
 * - Easy to understand and maintain for simple cases
 * - Good for CRUD-heavy applications
 *
 * Disadvantages:
 * - Tight coupling to database schema
 * - Difficult to test in isolation
 * - Not suitable for complex domain logic
 * - Can lead to anemic domain models
 *
 * Real-world use cases:
 * - Ruby on Rails ActiveRecord ORM
 * - Simple CRUD applications
 * - Rapid prototyping
 * - Admin panels and back-office systems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ActiveRecord Pattern Demo ===\n");

        demonstrateBasicCRUD();
        demonstrateDomainLogic();
        demonstrateRelationships();
        demonstrateValidation();
        demonstrateTransactions();
        demonstrateQueryMethods();
        demonstrateInheritance();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates basic CRUD operations with Active Record.
     */
    private static void demonstrateBasicCRUD() {
        System.out.println("--- Basic CRUD Operations ---");

        // Create new customer
        Customer customer = new Customer();
        customer.setName("John Doe");
        customer.setEmail("john.doe@example.com");
        customer.setPhone("555-1234");
        customer.save();
        System.out.println("Created customer: " + customer);

        // Read customer
        Customer loaded = Customer.find(customer.getId());
        System.out.println("Loaded customer: " + loaded);

        // Update customer
        loaded.setEmail("john.new@example.com");
        loaded.save();
        System.out.println("Updated customer: " + loaded);

        // Delete customer (will demonstrate later with proper cleanup)
        System.out.println("CRUD operations completed");
    }

    /**
     * Demonstrates domain logic embedded in Active Record.
     */
    private static void demonstrateDomainLogic() {
        System.out.println("\n--- Domain Logic in Active Record ---");

        // Create order with business logic
        Order order = new Order();
        order.setCustomerId(1L);
        order.setOrderDate(new Date());
        order.setStatus("PENDING");

        // Add line items
        order.addLineItem("PROD-001", 2, new BigDecimal("29.99"));
        order.addLineItem("PROD-002", 1, new BigDecimal("49.99"));
        order.addLineItem("PROD-003", 3, new BigDecimal("9.99"));

        // Calculate total using domain logic
        BigDecimal total = order.calculateTotal();
        System.out.println("Order total: $" + total);

        // Apply discount using business rules
        order.applyDiscount(new BigDecimal("10.00"));
        System.out.println("After discount: $" + order.calculateTotal());

        // Validate and save
        if (order.isValid()) {
            order.save();
            System.out.println("Order saved: " + order);
        }
    }

    /**
     * Demonstrates relationships between Active Records.
     */
    private static void demonstrateRelationships() {
        System.out.println("\n--- Active Record Relationships ---");

        // Create customer with orders
        Customer customer = new Customer();
        customer.setName("Jane Smith");
        customer.setEmail("jane.smith@example.com");
        customer.save();

        // One-to-Many: Customer has many orders
        Order order1 = new Order();
        order1.setCustomerId(customer.getId());
        order1.setOrderDate(new Date());
        order1.setStatus("COMPLETED");
        order1.save();

        Order order2 = new Order();
        order2.setCustomerId(customer.getId());
        order2.setOrderDate(new Date());
        order2.setStatus("PENDING");
        order2.save();

        // Load orders for customer
        List<Order> orders = customer.getOrders();
        System.out.println("Customer " + customer.getName() + " has " + orders.size() + " orders");

        // Many-to-One: Order belongs to customer
        Customer orderOwner = order1.getCustomer();
        System.out.println("Order belongs to: " + orderOwner.getName());
    }

    /**
     * Demonstrates validation in Active Record.
     */
    private static void demonstrateValidation() {
        System.out.println("\n--- Validation in Active Record ---");

        // Valid product
        Product validProduct = new Product();
        validProduct.setSku("PROD-100");
        validProduct.setName("Laptop Computer");
        validProduct.setPrice(new BigDecimal("999.99"));
        validProduct.setStockQuantity(10);

        if (validProduct.isValid()) {
            validProduct.save();
            System.out.println("Valid product saved: " + validProduct.getName());
        }

        // Invalid product (missing required fields)
        Product invalidProduct = new Product();
        invalidProduct.setPrice(new BigDecimal("-10.00")); // Invalid price

        if (!invalidProduct.isValid()) {
            System.out.println("Invalid product errors:");
            for (String error : invalidProduct.getErrors()) {
                System.out.println("  - " + error);
            }
        }

        // Product with business rule validation
        Product expensiveProduct = new Product();
        expensiveProduct.setSku("PROD-200");
        expensiveProduct.setName("Diamond Ring");
        expensiveProduct.setPrice(new BigDecimal("50000.00"));
        expensiveProduct.setStockQuantity(1);

        if (expensiveProduct.requiresApproval()) {
            System.out.println("Product requires manager approval due to high price");
        }
    }

    /**
     * Demonstrates transaction management.
     */
    private static void demonstrateTransactions() {
        System.out.println("\n--- Transaction Management ---");

        // Single transaction for multiple operations
        try {
            Order order = new Order();
            order.setCustomerId(1L);
            order.setOrderDate(new Date());
            order.setStatus("PENDING");

            // Begin transaction
            order.beginTransaction();

            // Save order
            order.save();

            // Update inventory
            Product product = Product.find(1L);
            product.decreaseStock(5);
            product.save();

            // Commit transaction
            order.commitTransaction();
            System.out.println("Transaction committed successfully");

        } catch (Exception e) {
            System.out.println("Transaction rolled back: " + e.getMessage());
        }
    }

    /**
     * Demonstrates query methods on Active Record.
     */
    private static void demonstrateQueryMethods() {
        System.out.println("\n--- Query Methods ---");

        // Find by ID
        Customer customer = Customer.find(1L);
        System.out.println("Found by ID: " + (customer != null ? customer.getName() : "Not found"));

        // Find all
        List<Customer> allCustomers = Customer.findAll();
        System.out.println("Total customers: " + allCustomers.size());

        // Find with conditions
        List<Customer> activeCustomers = Customer.where("status = ?", "ACTIVE");
        System.out.println("Active customers: " + activeCustomers.size());

        // Find first
        Customer firstCustomer = Customer.findFirst("ORDER BY created_at DESC");
        System.out.println("Most recent customer: " + (firstCustomer != null ? firstCustomer.getName() : "None"));

        // Count records
        long count = Customer.count();
        System.out.println("Customer count: " + count);

        // Custom query methods
        List<Order> recentOrders = Order.findRecentOrders(30);
        System.out.println("Orders in last 30 days: " + recentOrders.size());

        List<Product> lowStock = Product.findLowStock(5);
        System.out.println("Low stock products: " + lowStock.size());
    }

    /**
     * Demonstrates table inheritance with Active Record.
     */
    private static void demonstrateInheritance() {
        System.out.println("\n--- Table Inheritance ---");

        // Single Table Inheritance example
        Employee employee = new Employee();
        employee.setName("Bob Johnson");
        employee.setType("FULL_TIME");
        employee.setSalary(new BigDecimal("75000"));
        employee.save();
        System.out.println("Saved employee: " + employee.getName());

        Manager manager = new Manager();
        manager.setName("Alice Williams");
        manager.setType("MANAGER");
        manager.setSalary(new BigDecimal("95000"));
        manager.setDepartment("Engineering");
        manager.save();
        System.out.println("Saved manager: " + manager.getName());

        // Load by type
        List<Employee> allEmployees = Employee.findAll();
        System.out.println("Total employees: " + allEmployees.size());
    }

    /**
     * Demonstrates real-world scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        // Scenario 1: E-commerce order processing
        System.out.println("\n1. E-commerce Order Processing:");
        processEcommerceOrder();

        // Scenario 2: Inventory management
        System.out.println("\n2. Inventory Management:");
        manageInventory();

        // Scenario 3: Customer loyalty program
        System.out.println("\n3. Customer Loyalty Program:");
        manageLoyaltyProgram();

        // Scenario 4: Audit logging
        System.out.println("\n4. Audit Logging:");
        demonstrateAuditLog();

        // Scenario 5: Soft delete
        System.out.println("\n5. Soft Delete:");
        demonstrateSoftDelete();
    }

    private static void processEcommerceOrder() {
        // Create customer
        Customer customer = new Customer();
        customer.setName("Sarah Connor");
        customer.setEmail("sarah.connor@example.com");
        customer.setLoyaltyPoints(100);
        customer.save();

        // Create order
        Order order = new Order();
        order.setCustomerId(customer.getId());
        order.setOrderDate(new Date());
        order.setStatus("PENDING");

        // Add items
        order.addLineItem("LAPTOP-001", 1, new BigDecimal("1299.99"));
        order.addLineItem("MOUSE-001", 1, new BigDecimal("29.99"));
        order.addLineItem("KEYBOARD-001", 1, new BigDecimal("79.99"));

        // Apply loyalty discount
        BigDecimal discount = customer.calculateLoyaltyDiscount(order.calculateTotal());
        order.setDiscount(discount);

        // Save order
        order.save();

        // Update customer loyalty points
        customer.addLoyaltyPoints(order.calculateTotal().intValue() / 10);
        customer.save();

        System.out.println("   Order processed: " + order.getId());
        System.out.println("   Total: $" + order.calculateTotal());
        System.out.println("   Customer loyalty points: " + customer.getLoyaltyPoints());
    }

    private static void manageInventory() {
        Product product = new Product();
        product.setSku("WIDGET-001");
        product.setName("Super Widget");
        product.setPrice(new BigDecimal("49.99"));
        product.setStockQuantity(100);
        product.setReorderLevel(20);
        product.save();

        // Decrease stock
        product.decreaseStock(85);
        product.save();

        // Check if reorder needed
        if (product.needsReorder()) {
            System.out.println("   Product " + product.getName() + " needs reorder");
            System.out.println("   Current stock: " + product.getStockQuantity());
            System.out.println("   Reorder level: " + product.getReorderLevel());
        }

        // Restock
        product.increaseStock(50);
        product.save();
        System.out.println("   Restocked to: " + product.getStockQuantity());
    }

    private static void manageLoyaltyProgram() {
        Customer customer = new Customer();
        customer.setName("John Loyalty");
        customer.setEmail("john.loyalty@example.com");
        customer.setLoyaltyPoints(0);
        customer.setLoyaltyTier("BRONZE");
        customer.save();

        // Make purchases and earn points
        customer.addLoyaltyPoints(100);
        customer.addLoyaltyPoints(250);
        customer.addLoyaltyPoints(500);

        // Upgrade tier based on points
        customer.updateLoyaltyTier();
        customer.save();

        System.out.println("   Customer: " + customer.getName());
        System.out.println("   Loyalty points: " + customer.getLoyaltyPoints());
        System.out.println("   Loyalty tier: " + customer.getLoyaltyTier());

        // Redeem points
        boolean redeemed = customer.redeemPoints(200);
        if (redeemed) {
            customer.save();
            System.out.println("   Redeemed 200 points");
            System.out.println("   Remaining points: " + customer.getLoyaltyPoints());
        }
    }

    private static void demonstrateAuditLog() {
        AuditableProduct product = new AuditableProduct();
        product.setSku("AUDIT-001");
        product.setName("Audited Product");
        product.setPrice(new BigDecimal("99.99"));
        product.save(); // Creates audit log on insert

        product.setPrice(new BigDecimal("89.99"));
        product.save(); // Creates audit log on update

        List<AuditLog> logs = product.getAuditLogs();
        System.out.println("   Audit logs for product " + product.getSku() + ":");
        for (AuditLog log : logs) {
            System.out.println("     " + log.getAction() + " at " + log.getTimestamp() +
                             " by " + log.getUser());
        }
    }

    private static void demonstrateSoftDelete() {
        SoftDeletableCustomer customer = new SoftDeletableCustomer();
        customer.setName("Temporary Customer");
        customer.setEmail("temp@example.com");
        customer.save();

        Long customerId = customer.getId();
        System.out.println("   Created customer: " + customer.getName());

        // Soft delete
        customer.softDelete();
        System.out.println("   Soft deleted customer (still in database)");

        // Try to find (won't find because it's deleted)
        SoftDeletableCustomer found = SoftDeletableCustomer.find(customerId);
        System.out.println("   Finding active customer: " + (found == null ? "Not found" : "Found"));

        // Find including deleted
        SoftDeletableCustomer foundWithDeleted = SoftDeletableCustomer.findIncludingDeleted(customerId);
        System.out.println("   Finding with deleted: " +
                         (foundWithDeleted != null ? "Found (deleted at " +
                          foundWithDeleted.getDeletedAt() + ")" : "Not found"));

        // Restore
        if (foundWithDeleted != null) {
            foundWithDeleted.restore();
            System.out.println("   Restored customer");
        }

        // Hard delete
        if (foundWithDeleted != null) {
            foundWithDeleted.hardDelete();
            System.out.println("   Permanently deleted customer");
        }
    }
}
