package Enterprise.Base.LayerSupertype;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Layer Supertype Pattern Demonstration
 *
 * Intent: A type that acts as the supertype for all types in its layer
 *
 * Use When:
 * - You have common behavior that all objects in a layer need
 * - You want to avoid duplication of common features
 * - You need a place to put common fields and methods
 * - You want a consistent interface for all domain objects
 *
 * Enterprise Context:
 * This pattern is fundamental in enterprise applications where domain objects
 * share common behaviors like ID management, versioning, auditing, and persistence.
 */
public class Main {

    /**
     * Base Layer Supertype - All domain objects extend this
     * Provides common functionality for all entities in the system
     */
    abstract static class DomainObject {
        private Long id;
        private int version;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
        private String updatedBy;
        private boolean deleted;

        /**
         * Constructor initializes common fields
         */
        public DomainObject() {
            this.createdAt = LocalDateTime.now();
            this.updatedAt = LocalDateTime.now();
            this.version = 0;
            this.deleted = false;
        }

        // Common getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public int getVersion() { return version; }
        public void incrementVersion() { this.version++; this.updatedAt = LocalDateTime.now(); }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }

        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

        public String getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; this.updatedAt = LocalDateTime.now(); }

        public boolean isDeleted() { return deleted; }
        public void markDeleted() { this.deleted = true; this.updatedAt = LocalDateTime.now(); }

        /**
         * Template method for validation - subclasses override
         */
        public abstract boolean validate();

        /**
         * Template method for business key - subclasses override
         */
        public abstract String getBusinessKey();

        /**
         * Common save behavior
         */
        public void save() {
            if (!validate()) {
                throw new IllegalStateException("Validation failed for " + getBusinessKey());
            }
            incrementVersion();
            System.out.println("Saving " + this.getClass().getSimpleName() + " [" + getBusinessKey() + "] version " + version);
        }

        /**
         * Common audit trail
         */
        public String getAuditTrail() {
            return String.format("Created: %s by %s | Updated: %s by %s | Version: %d",
                createdAt, createdBy, updatedAt, updatedBy, version);
        }
    }

    /**
     * Customer entity - extends Layer Supertype
     */
    static class Customer extends DomainObject {
        private String email;
        private String name;
        private CustomerType type;
        private double creditLimit;

        public Customer(String email, String name, CustomerType type) {
            super();
            this.email = email;
            this.name = name;
            this.type = type;
            this.creditLimit = type.getDefaultCreditLimit();
        }

        @Override
        public boolean validate() {
            return email != null && email.contains("@") && name != null && !name.isEmpty();
        }

        @Override
        public String getBusinessKey() {
            return "CUSTOMER-" + email;
        }

        public void upgradeToPremium() {
            this.type = CustomerType.PREMIUM;
            this.creditLimit = CustomerType.PREMIUM.getDefaultCreditLimit();
        }

        // Getters
        public String getEmail() { return email; }
        public String getName() { return name; }
        public CustomerType getType() { return type; }
        public double getCreditLimit() { return creditLimit; }
        public void setCreditLimit(double creditLimit) { this.creditLimit = creditLimit; }
    }

    /**
     * Order entity - extends Layer Supertype
     */
    static class Order extends DomainObject {
        private String orderNumber;
        private Customer customer;
        private List<OrderLine> lines;
        private OrderStatus status;
        private double totalAmount;

        public Order(String orderNumber, Customer customer) {
            super();
            this.orderNumber = orderNumber;
            this.customer = customer;
            this.lines = new ArrayList<>();
            this.status = OrderStatus.DRAFT;
            this.totalAmount = 0.0;
        }

        @Override
        public boolean validate() {
            return orderNumber != null && customer != null && !lines.isEmpty();
        }

        @Override
        public String getBusinessKey() {
            return "ORDER-" + orderNumber;
        }

        public void addLine(OrderLine line) {
            lines.add(line);
            calculateTotal();
        }

        private void calculateTotal() {
            totalAmount = lines.stream().mapToDouble(OrderLine::getAmount).sum();
        }

        public void submit() {
            if (status != OrderStatus.DRAFT) {
                throw new IllegalStateException("Can only submit draft orders");
            }
            if (totalAmount > customer.getCreditLimit()) {
                throw new IllegalStateException("Order exceeds customer credit limit");
            }
            status = OrderStatus.SUBMITTED;
        }

        public void approve() {
            if (status != OrderStatus.SUBMITTED) {
                throw new IllegalStateException("Can only approve submitted orders");
            }
            status = OrderStatus.APPROVED;
        }

        // Getters
        public String getOrderNumber() { return orderNumber; }
        public Customer getCustomer() { return customer; }
        public List<OrderLine> getLines() { return Collections.unmodifiableList(lines); }
        public OrderStatus getStatus() { return status; }
        public double getTotalAmount() { return totalAmount; }
    }

    /**
     * OrderLine entity - extends Layer Supertype
     */
    static class OrderLine extends DomainObject {
        private Order order;
        private Product product;
        private int quantity;
        private double price;

        public OrderLine(Order order, Product product, int quantity, double price) {
            super();
            this.order = order;
            this.product = product;
            this.quantity = quantity;
            this.price = price;
        }

        @Override
        public boolean validate() {
            return product != null && quantity > 0 && price >= 0;
        }

        @Override
        public String getBusinessKey() {
            return "ORDERLINE-" + order.getOrderNumber() + "-" + product.getSku();
        }

        public double getAmount() {
            return quantity * price;
        }

        // Getters
        public Product getProduct() { return product; }
        public int getQuantity() { return quantity; }
        public double getPrice() { return price; }
    }

    /**
     * Product entity - extends Layer Supertype
     */
    static class Product extends DomainObject {
        private String sku;
        private String name;
        private double price;
        private int stockLevel;

        public Product(String sku, String name, double price, int stockLevel) {
            super();
            this.sku = sku;
            this.name = name;
            this.price = price;
            this.stockLevel = stockLevel;
        }

        @Override
        public boolean validate() {
            return sku != null && !sku.isEmpty() && name != null && price >= 0;
        }

        @Override
        public String getBusinessKey() {
            return "PRODUCT-" + sku;
        }

        public boolean reserveStock(int quantity) {
            if (stockLevel >= quantity) {
                stockLevel -= quantity;
                return true;
            }
            return false;
        }

        public void replenish(int quantity) {
            stockLevel += quantity;
        }

        // Getters
        public String getSku() { return sku; }
        public String getName() { return name; }
        public double getPrice() { return price; }
        public int getStockLevel() { return stockLevel; }
    }

    /**
     * Invoice entity - extends Layer Supertype
     */
    static class Invoice extends DomainObject {
        private String invoiceNumber;
        private Order order;
        private LocalDateTime dueDate;
        private InvoiceStatus status;
        private double amountPaid;

        public Invoice(String invoiceNumber, Order order) {
            super();
            this.invoiceNumber = invoiceNumber;
            this.order = order;
            this.dueDate = LocalDateTime.now().plusDays(30);
            this.status = InvoiceStatus.UNPAID;
            this.amountPaid = 0.0;
        }

        @Override
        public boolean validate() {
            return invoiceNumber != null && order != null && order.getStatus() == OrderStatus.APPROVED;
        }

        @Override
        public String getBusinessKey() {
            return "INVOICE-" + invoiceNumber;
        }

        public void recordPayment(double amount) {
            if (status == InvoiceStatus.PAID) {
                throw new IllegalStateException("Invoice already paid");
            }
            amountPaid += amount;
            if (amountPaid >= order.getTotalAmount()) {
                status = InvoiceStatus.PAID;
            } else {
                status = InvoiceStatus.PARTIAL;
            }
        }

        public boolean isOverdue() {
            return status != InvoiceStatus.PAID && LocalDateTime.now().isAfter(dueDate);
        }

        // Getters
        public String getInvoiceNumber() { return invoiceNumber; }
        public Order getOrder() { return order; }
        public InvoiceStatus getStatus() { return status; }
        public double getAmountPaid() { return amountPaid; }
        public double getAmountDue() { return order.getTotalAmount() - amountPaid; }
    }

    // Supporting enums and types
    enum CustomerType {
        STANDARD(1000.0),
        PREMIUM(5000.0),
        ENTERPRISE(50000.0);

        private final double defaultCreditLimit;

        CustomerType(double defaultCreditLimit) {
            this.defaultCreditLimit = defaultCreditLimit;
        }

        public double getDefaultCreditLimit() {
            return defaultCreditLimit;
        }
    }

    enum OrderStatus {
        DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
    }

    enum InvoiceStatus {
        UNPAID, PARTIAL, PAID, OVERDUE, CANCELLED
    }

    /**
     * Repository pattern using Layer Supertype
     */
    static class Repository<T extends DomainObject> {
        private final Map<Long, T> storage = new ConcurrentHashMap<>();
        private final AtomicLong idGenerator = new AtomicLong(1);

        public void save(T entity) {
            if (entity.getId() == null) {
                entity.setId(idGenerator.getAndIncrement());
            }
            entity.save();
            storage.put(entity.getId(), entity);
        }

        public T findById(Long id) {
            return storage.get(id);
        }

        public List<T> findAll() {
            return new ArrayList<>(storage.values());
        }

        public void delete(T entity) {
            entity.markDeleted();
            storage.remove(entity.getId());
        }

        public int count() {
            return storage.size();
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Layer Supertype Pattern Demo ===\n");

        // Initialize repositories
        Repository<Customer> customerRepo = new Repository<>();
        Repository<Product> productRepo = new Repository<>();
        Repository<Order> orderRepo = new Repository<>();
        Repository<Invoice> invoiceRepo = new Repository<>();

        // Scenario 1: Customer Creation and Management
        System.out.println("--- Scenario 1: Customer Management ---");
        Customer customer1 = new Customer("john@example.com", "John Doe", CustomerType.STANDARD);
        customer1.setCreatedBy("admin");
        customerRepo.save(customer1);
        System.out.println(customer1.getAuditTrail());
        System.out.println("Customer credit limit: $" + customer1.getCreditLimit());

        // Scenario 2: Customer Upgrade
        System.out.println("\n--- Scenario 2: Customer Upgrade ---");
        customer1.upgradeToPremium();
        customer1.setUpdatedBy("sales-manager");
        customerRepo.save(customer1);
        System.out.println("Upgraded to " + customer1.getType());
        System.out.println("New credit limit: $" + customer1.getCreditLimit());
        System.out.println(customer1.getAuditTrail());

        // Scenario 3: Product Management
        System.out.println("\n--- Scenario 3: Product Management ---");
        Product product1 = new Product("LAPTOP-001", "Professional Laptop", 1200.0, 50);
        product1.setCreatedBy("inventory-manager");
        productRepo.save(product1);

        Product product2 = new Product("MOUSE-001", "Wireless Mouse", 25.0, 200);
        product2.setCreatedBy("inventory-manager");
        productRepo.save(product2);

        System.out.println("Products in catalog: " + productRepo.count());

        // Scenario 4: Order Creation
        System.out.println("\n--- Scenario 4: Order Creation ---");
        Order order1 = new Order("ORD-2024-001", customer1);
        order1.setCreatedBy("web-portal");

        OrderLine line1 = new OrderLine(order1, product1, 2, product1.getPrice());
        line1.setCreatedBy("web-portal");
        order1.addLine(line1);

        OrderLine line2 = new OrderLine(order1, product2, 3, product2.getPrice());
        line2.setCreatedBy("web-portal");
        order1.addLine(line2);

        orderRepo.save(order1);
        System.out.println("Order total: $" + order1.getTotalAmount());
        System.out.println("Order status: " + order1.getStatus());

        // Scenario 5: Order Submission and Approval
        System.out.println("\n--- Scenario 5: Order Processing ---");
        order1.submit();
        order1.setUpdatedBy("customer");
        orderRepo.save(order1);
        System.out.println("Order submitted: " + order1.getStatus());

        order1.approve();
        order1.setUpdatedBy("order-manager");
        orderRepo.save(order1);
        System.out.println("Order approved: " + order1.getStatus());
        System.out.println(order1.getAuditTrail());

        // Scenario 6: Stock Reservation
        System.out.println("\n--- Scenario 6: Stock Management ---");
        for (OrderLine line : order1.getLines()) {
            Product product = line.getProduct();
            boolean reserved = product.reserveStock(line.getQuantity());
            product.setUpdatedBy("order-system");
            productRepo.save(product);
            System.out.println(product.getName() + " - Reserved: " + reserved +
                             " - Remaining stock: " + product.getStockLevel());
        }

        // Scenario 7: Invoice Generation
        System.out.println("\n--- Scenario 7: Invoice Generation ---");
        Invoice invoice1 = new Invoice("INV-2024-001", order1);
        invoice1.setCreatedBy("billing-system");
        invoiceRepo.save(invoice1);
        System.out.println("Invoice created: " + invoice1.getInvoiceNumber());
        System.out.println("Amount due: $" + invoice1.getAmountDue());
        System.out.println("Status: " + invoice1.getStatus());

        // Scenario 8: Partial Payment
        System.out.println("\n--- Scenario 8: Payment Processing ---");
        invoice1.recordPayment(1500.0);
        invoice1.setUpdatedBy("payment-gateway");
        invoiceRepo.save(invoice1);
        System.out.println("Payment recorded: $1500.00");
        System.out.println("Status: " + invoice1.getStatus());
        System.out.println("Remaining balance: $" + invoice1.getAmountDue());

        // Scenario 9: Full Payment
        System.out.println("\n--- Scenario 9: Final Payment ---");
        invoice1.recordPayment(invoice1.getAmountDue());
        invoice1.setUpdatedBy("payment-gateway");
        invoiceRepo.save(invoice1);
        System.out.println("Final payment recorded");
        System.out.println("Status: " + invoice1.getStatus());
        System.out.println(invoice1.getAuditTrail());

        // Scenario 10: Versioning and Audit Trail
        System.out.println("\n--- Scenario 10: Version History ---");
        System.out.println("Customer version: " + customer1.getVersion());
        System.out.println("Order version: " + order1.getVersion());
        System.out.println("Invoice version: " + invoice1.getVersion());

        // Demonstrate soft delete
        System.out.println("\n--- Scenario 11: Soft Delete ---");
        Product product3 = new Product("OLD-001", "Deprecated Product", 10.0, 0);
        productRepo.save(product3);
        System.out.println("Product created: " + product3.getBusinessKey());

        product3.markDeleted();
        System.out.println("Product marked as deleted: " + product3.isDeleted());
        productRepo.delete(product3);
        System.out.println("Product removed from active catalog");

        // Summary
        System.out.println("\n--- Repository Summary ---");
        System.out.println("Total customers: " + customerRepo.count());
        System.out.println("Total products: " + productRepo.count());
        System.out.println("Total orders: " + orderRepo.count());
        System.out.println("Total invoices: " + invoiceRepo.count());

        System.out.println("\n=== Benefits of Layer Supertype ===");
        System.out.println("1. Common behavior (ID, versioning, audit) in one place");
        System.out.println("2. Consistent interface for all domain objects");
        System.out.println("3. Easy to add new common features");
        System.out.println("4. Template method pattern for validation");
        System.out.println("5. Simplified repository implementation");

        System.out.println("\nPattern demonstration complete.");
    }
}
