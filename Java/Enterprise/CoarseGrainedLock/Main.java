package Enterprise.CoarseGrainedLock;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

/**
 * Coarse-Grained Lock Pattern Demonstration
 *
 * Intent: Locks a set of related objects with a single lock, simplifying
 * concurrency control and preventing deadlocks in multi-threaded environments.
 *
 * Key Concepts:
 * - Single lock protects entire object graph
 * - Prevents complex locking hierarchies
 * - Reduces deadlock potential
 * - May reduce concurrency but increases safety
 * - Trade-off: simplicity vs. granular performance
 *
 * Real-world examples:
 * - Banking account with transactions and statements
 * - Shopping cart with items and pricing
 * - Order with line items and shipping info
 * - Document with sections and formatting
 * - Customer profile with addresses and payment methods
 *
 * Database Schema Examples:
 *
 * CREATE TABLE accounts (
 *     account_id BIGINT PRIMARY KEY,
 *     customer_name VARCHAR(255),
 *     balance DECIMAL(15,2),
 *     version BIGINT,
 *     lock_owner VARCHAR(100),
 *     locked_at TIMESTAMP
 * );
 *
 * CREATE TABLE transactions (
 *     transaction_id BIGINT PRIMARY KEY,
 *     account_id BIGINT REFERENCES accounts(account_id),
 *     amount DECIMAL(15,2),
 *     transaction_date TIMESTAMP,
 *     description VARCHAR(500)
 * );
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Coarse-Grained Lock Pattern Demo ===\n");

        // Scenario 1: Bank Account with Transactions
        demonstrateBankAccountLocking();

        // Scenario 2: Shopping Cart Operations
        demonstrateShoppingCartLocking();

        // Scenario 3: Order Processing
        demonstrateOrderProcessingLocking();

        // Scenario 4: Document Editing
        demonstrateDocumentEditingLocking();

        // Scenario 5: Customer Profile Management
        demonstrateCustomerProfileLocking();

        // Scenario 6: Inventory Management
        demonstrateInventoryManagementLocking();

        // Scenario 7: Concurrent Transfer Prevention
        demonstrateConcurrentTransferPrevention();

        // Scenario 8: Deadlock Prevention
        demonstrateDeadlockPrevention();

        // Scenario 9: Version-based Optimistic Locking
        demonstrateOptimisticLocking();

        // Scenario 10: Lock Timeout and Recovery
        demonstrateLockTimeoutRecovery();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Bank account with coarse-grained locking
     * Demonstrates locking entire account including all transactions
     */
    private static void demonstrateBankAccountLocking() throws InterruptedException {
        System.out.println("--- Scenario 1: Bank Account Locking ---");

        BankAccount account = new BankAccount(1001, "John Doe", 10000.0);

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Multiple threads trying to perform operations
        Runnable deposit = () -> {
            try {
                account.deposit(500.0, "Salary deposit");
                System.out.println("  Deposit completed by " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        };

        Runnable withdrawal = () -> {
            try {
                account.withdraw(300.0, "ATM withdrawal");
                System.out.println("  Withdrawal completed by " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        };

        Runnable checkBalance = () -> {
            try {
                double balance = account.getBalance();
                System.out.println("  Balance checked: $" + balance + " by " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        };

        // Execute concurrent operations
        executor.submit(deposit);
        executor.submit(withdrawal);
        executor.submit(checkBalance);

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final balance: $" + account.getCurrentBalance());
        System.out.println("Transaction count: " + account.getTransactionCount());
        System.out.println();
    }

    /**
     * Scenario 2: Shopping cart with concurrent modifications
     */
    private static void demonstrateShoppingCartLocking() throws InterruptedException {
        System.out.println("--- Scenario 2: Shopping Cart Locking ---");

        ShoppingCart cart = new ShoppingCart("CART-001", "Alice");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(() -> {
            try {
                cart.addItem("Laptop", 1299.99, 1);
                System.out.println("  Added laptop");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                cart.addItem("Mouse", 29.99, 2);
                System.out.println("  Added mouse");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                double total = cart.getTotal();
                System.out.println("  Cart total calculated: $" + total);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final cart total: $" + cart.getCurrentTotal());
        System.out.println("Item count: " + cart.getItemCount());
        System.out.println();
    }

    /**
     * Scenario 3: Order processing with line items
     */
    private static void demonstrateOrderProcessingLocking() throws InterruptedException {
        System.out.println("--- Scenario 3: Order Processing Locking ---");

        Order order = new Order("ORD-1001", "Bob Smith");

        ExecutorService executor = Executors.newFixedThreadPool(4);

        executor.submit(() -> {
            try {
                order.addLineItem("Product A", 49.99, 2);
                System.out.println("  Added Product A");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                order.addLineItem("Product B", 79.99, 1);
                System.out.println("  Added Product B");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                order.setShippingAddress("123 Main St, City, State");
                System.out.println("  Set shipping address");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                String status = order.getOrderStatus();
                System.out.println("  Order status: " + status);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final order total: $" + order.getOrderTotal());
        System.out.println("Line items: " + order.getLineItemCount());
        System.out.println();
    }

    /**
     * Scenario 4: Document editing with sections
     */
    private static void demonstrateDocumentEditingLocking() throws InterruptedException {
        System.out.println("--- Scenario 4: Document Editing Locking ---");

        Document document = new Document("DOC-001", "Project Proposal");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(() -> {
            try {
                document.addSection("Introduction", "This is the introduction...");
                System.out.println("  Added introduction section");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                document.addSection("Methodology", "Our methodology includes...");
                System.out.println("  Added methodology section");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                document.setTitle("Updated Project Proposal");
                System.out.println("  Updated document title");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Document title: " + document.getTitle());
        System.out.println("Section count: " + document.getSectionCount());
        System.out.println();
    }

    /**
     * Scenario 5: Customer profile with addresses and payment methods
     */
    private static void demonstrateCustomerProfileLocking() throws InterruptedException {
        System.out.println("--- Scenario 5: Customer Profile Locking ---");

        CustomerProfile profile = new CustomerProfile("CUST-001", "Carol Johnson");

        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(() -> {
            try {
                profile.addAddress("Home", "456 Oak Ave, Town, State");
                System.out.println("  Added home address");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                profile.addPaymentMethod("Credit Card", "****1234");
                System.out.println("  Added payment method");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                profile.updateEmail("carol.johnson@example.com");
                System.out.println("  Updated email");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Profile: " + profile.getName());
        System.out.println("Addresses: " + profile.getAddressCount());
        System.out.println("Payment methods: " + profile.getPaymentMethodCount());
        System.out.println();
    }

    /**
     * Scenario 6: Inventory management with stock tracking
     */
    private static void demonstrateInventoryManagementLocking() throws InterruptedException {
        System.out.println("--- Scenario 6: Inventory Management Locking ---");

        InventoryItem item = new InventoryItem("ITEM-001", "Widget", 100);

        ExecutorService executor = Executors.newFixedThreadPool(5);

        // Multiple threads trying to reserve stock
        for (int i = 0; i < 5; i++) {
            int quantity = 15 + i * 5;
            executor.submit(() -> {
                try {
                    boolean reserved = item.reserveStock(quantity);
                    System.out.println("  Reserve " + quantity + " units: " +
                        (reserved ? "SUCCESS" : "FAILED"));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Remaining stock: " + item.getAvailableStock());
        System.out.println("Reserved stock: " + item.getReservedStock());
        System.out.println();
    }

    /**
     * Scenario 7: Preventing concurrent transfers between accounts
     */
    private static void demonstrateConcurrentTransferPrevention() throws InterruptedException {
        System.out.println("--- Scenario 7: Concurrent Transfer Prevention ---");

        BankAccount account1 = new BankAccount(2001, "Alice", 5000.0);
        BankAccount account2 = new BankAccount(2002, "Bob", 5000.0);

        TransferService transferService = new TransferService();

        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Try two simultaneous transfers
        executor.submit(() -> {
            try {
                boolean success = transferService.transfer(account1, account2, 1000.0);
                System.out.println("  Transfer 1 (Alice->Bob): " +
                    (success ? "SUCCESS" : "FAILED"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                boolean success = transferService.transfer(account2, account1, 800.0);
                System.out.println("  Transfer 2 (Bob->Alice): " +
                    (success ? "SUCCESS" : "FAILED"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Alice balance: $" + account1.getCurrentBalance());
        System.out.println("Bob balance: $" + account2.getCurrentBalance());
        System.out.println();
    }

    /**
     * Scenario 8: Deadlock prevention using lock ordering
     */
    private static void demonstrateDeadlockPrevention() throws InterruptedException {
        System.out.println("--- Scenario 8: Deadlock Prevention ---");

        Resource resourceA = new Resource("Resource-A");
        Resource resourceB = new Resource("Resource-B");

        ResourceManager manager = new ResourceManager();

        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Thread 1: A then B
        executor.submit(() -> {
            try {
                manager.useResourcesSafely(resourceA, resourceB, "Thread-1");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Thread 2: B then A (would deadlock without proper ordering)
        executor.submit(() -> {
            try {
                manager.useResourcesSafely(resourceB, resourceA, "Thread-2");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("All operations completed without deadlock");
        System.out.println();
    }

    /**
     * Scenario 9: Optimistic locking with version numbers
     */
    private static void demonstrateOptimisticLocking() throws InterruptedException {
        System.out.println("--- Scenario 9: Optimistic Locking ---");

        VersionedAccount account = new VersionedAccount(3001, "Charlie", 10000.0);

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Multiple threads trying to update
        for (int i = 1; i <= 3; i++) {
            int threadNum = i;
            executor.submit(() -> {
                try {
                    long version = account.getVersion();
                    Thread.sleep(50); // Simulate processing time
                    boolean success = account.updateBalanceOptimistic(
                        version, 100.0 * threadNum);
                    System.out.println("  Thread-" + threadNum + " update: " +
                        (success ? "SUCCESS" : "FAILED (version mismatch)"));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final balance: $" + account.getBalance());
        System.out.println("Final version: " + account.getVersion());
        System.out.println();
    }

    /**
     * Scenario 10: Lock timeout and recovery mechanisms
     */
    private static void demonstrateLockTimeoutRecovery() throws InterruptedException {
        System.out.println("--- Scenario 10: Lock Timeout and Recovery ---");

        TimeoutAccount account = new TimeoutAccount(4001, "Diana", 5000.0);

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Thread 1: Hold lock for extended period
        executor.submit(() -> {
            try {
                account.performLongOperation();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread.sleep(100); // Let thread 1 acquire lock

        // Thread 2 and 3: Try to acquire with timeout
        executor.submit(() -> {
            try {
                boolean acquired = account.tryOperationWithTimeout(500);
                System.out.println("  Thread-2 lock acquisition: " +
                    (acquired ? "SUCCESS" : "TIMEOUT"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                boolean acquired = account.tryOperationWithTimeout(500);
                System.out.println("  Thread-3 lock acquisition: " +
                    (acquired ? "SUCCESS" : "TIMEOUT"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("Timeout scenarios handled gracefully");
        System.out.println();
    }
}

// ============= Bank Account Implementation =============

/**
 * Bank account with coarse-grained locking.
 * All operations on the account and its transactions are protected by a single lock.
 */
class BankAccount {
    private final long accountId;
    private final String customerName;
    private double balance;
    private final List<Transaction> transactions;
    private final ReentrantLock lock;

    public BankAccount(long accountId, String customerName, double initialBalance) {
        this.accountId = accountId;
        this.customerName = customerName;
        this.balance = initialBalance;
        this.transactions = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    /**
     * Deposits money into the account.
     * Uses coarse-grained lock to protect both balance and transaction list.
     */
    public void deposit(double amount, String description) throws InterruptedException {
        lock.lock();
        try {
            balance += amount;
            transactions.add(new Transaction(amount, "DEPOSIT", description));
        } finally {
            lock.unlock();
        }
    }

    /**
     * Withdraws money from the account.
     */
    public void withdraw(double amount, String description) throws InterruptedException {
        lock.lock();
        try {
            if (balance >= amount) {
                balance -= amount;
                transactions.add(new Transaction(-amount, "WITHDRAWAL", description));
            }
        } finally {
            lock.unlock();
        }
    }

    /**
     * Gets current balance with lock protection.
     */
    public double getBalance() throws InterruptedException {
        lock.lock();
        try {
            return balance;
        } finally {
            lock.unlock();
        }
    }

    public double getCurrentBalance() {
        return balance;
    }

    public int getTransactionCount() {
        return transactions.size();
    }

    public ReentrantLock getLock() {
        return lock;
    }

    static class Transaction {
        final double amount;
        final String type;
        final String description;
        final long timestamp;

        Transaction(double amount, String type, String description) {
            this.amount = amount;
            this.type = type;
            this.description = description;
            this.timestamp = System.currentTimeMillis();
        }
    }
}

// ============= Shopping Cart Implementation =============

class ShoppingCart {
    private final String cartId;
    private final String customerId;
    private final List<CartItem> items;
    private final ReentrantLock lock;

    public ShoppingCart(String cartId, String customerId) {
        this.cartId = cartId;
        this.customerId = customerId;
        this.items = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public void addItem(String productName, double price, int quantity) throws InterruptedException {
        lock.lock();
        try {
            items.add(new CartItem(productName, price, quantity));
        } finally {
            lock.unlock();
        }
    }

    public double getTotal() throws InterruptedException {
        lock.lock();
        try {
            return items.stream().mapToDouble(item -> item.price * item.quantity).sum();
        } finally {
            lock.unlock();
        }
    }

    public double getCurrentTotal() {
        return items.stream().mapToDouble(item -> item.price * item.quantity).sum();
    }

    public int getItemCount() {
        return items.size();
    }

    static class CartItem {
        final String productName;
        final double price;
        final int quantity;

        CartItem(String productName, double price, int quantity) {
            this.productName = productName;
            this.price = price;
            this.quantity = quantity;
        }
    }
}

// ============= Order Implementation =============

class Order {
    private final String orderId;
    private final String customerName;
    private String shippingAddress;
    private final List<LineItem> lineItems;
    private final ReentrantLock lock;

    public Order(String orderId, String customerName) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.lineItems = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public void addLineItem(String productName, double price, int quantity) throws InterruptedException {
        lock.lock();
        try {
            lineItems.add(new LineItem(productName, price, quantity));
        } finally {
            lock.unlock();
        }
    }

    public void setShippingAddress(String address) throws InterruptedException {
        lock.lock();
        try {
            this.shippingAddress = address;
        } finally {
            lock.unlock();
        }
    }

    public String getOrderStatus() throws InterruptedException {
        lock.lock();
        try {
            return shippingAddress != null ? "READY_TO_SHIP" : "PENDING";
        } finally {
            lock.unlock();
        }
    }

    public double getOrderTotal() {
        return lineItems.stream().mapToDouble(item -> item.price * item.quantity).sum();
    }

    public int getLineItemCount() {
        return lineItems.size();
    }

    static class LineItem {
        final String productName;
        final double price;
        final int quantity;

        LineItem(String productName, double price, int quantity) {
            this.productName = productName;
            this.price = price;
            this.quantity = quantity;
        }
    }
}

// ============= Document Implementation =============

class Document {
    private final String documentId;
    private String title;
    private final List<Section> sections;
    private final ReentrantLock lock;

    public Document(String documentId, String title) {
        this.documentId = documentId;
        this.title = title;
        this.sections = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public void addSection(String sectionTitle, String content) throws InterruptedException {
        lock.lock();
        try {
            sections.add(new Section(sectionTitle, content));
        } finally {
            lock.unlock();
        }
    }

    public void setTitle(String title) throws InterruptedException {
        lock.lock();
        try {
            this.title = title;
        } finally {
            lock.unlock();
        }
    }

    public String getTitle() {
        return title;
    }

    public int getSectionCount() {
        return sections.size();
    }

    static class Section {
        final String title;
        final String content;

        Section(String title, String content) {
            this.title = title;
            this.content = content;
        }
    }
}

// ============= Customer Profile Implementation =============

class CustomerProfile {
    private final String customerId;
    private final String name;
    private String email;
    private final List<Address> addresses;
    private final List<PaymentMethod> paymentMethods;
    private final ReentrantLock lock;

    public CustomerProfile(String customerId, String name) {
        this.customerId = customerId;
        this.name = name;
        this.addresses = new ArrayList<>();
        this.paymentMethods = new ArrayList<>();
        this.lock = new ReentrantLock();
    }

    public void addAddress(String label, String address) throws InterruptedException {
        lock.lock();
        try {
            addresses.add(new Address(label, address));
        } finally {
            lock.unlock();
        }
    }

    public void addPaymentMethod(String type, String maskedNumber) throws InterruptedException {
        lock.lock();
        try {
            paymentMethods.add(new PaymentMethod(type, maskedNumber));
        } finally {
            lock.unlock();
        }
    }

    public void updateEmail(String email) throws InterruptedException {
        lock.lock();
        try {
            this.email = email;
        } finally {
            lock.unlock();
        }
    }

    public String getName() {
        return name;
    }

    public int getAddressCount() {
        return addresses.size();
    }

    public int getPaymentMethodCount() {
        return paymentMethods.size();
    }

    static class Address {
        final String label;
        final String address;

        Address(String label, String address) {
            this.label = label;
            this.address = address;
        }
    }

    static class PaymentMethod {
        final String type;
        final String maskedNumber;

        PaymentMethod(String type, String maskedNumber) {
            this.type = type;
            this.maskedNumber = maskedNumber;
        }
    }
}

// ============= Inventory Management =============

class InventoryItem {
    private final String itemId;
    private final String name;
    private int availableStock;
    private int reservedStock;
    private final ReentrantLock lock;

    public InventoryItem(String itemId, String name, int initialStock) {
        this.itemId = itemId;
        this.name = name;
        this.availableStock = initialStock;
        this.reservedStock = 0;
        this.lock = new ReentrantLock();
    }

    public boolean reserveStock(int quantity) throws InterruptedException {
        lock.lock();
        try {
            if (availableStock >= quantity) {
                availableStock -= quantity;
                reservedStock += quantity;
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }

    public int getAvailableStock() {
        return availableStock;
    }

    public int getReservedStock() {
        return reservedStock;
    }
}

// ============= Transfer Service =============

class TransferService {
    /**
     * Transfers money between accounts using lock ordering to prevent deadlock.
     */
    public boolean transfer(BankAccount from, BankAccount to, double amount)
            throws InterruptedException {
        // Lock ordering by account ID to prevent deadlock
        BankAccount first = from;
        BankAccount second = to;

        if (from.accountId > to.accountId) {
            first = to;
            second = from;
        }

        first.getLock().lock();
        try {
            second.getLock().lock();
            try {
                if (from.getCurrentBalance() >= amount) {
                    from.withdraw(amount, "Transfer out");
                    to.deposit(amount, "Transfer in");
                    return true;
                }
                return false;
            } finally {
                second.getLock().unlock();
            }
        } finally {
            first.getLock().unlock();
        }
    }
}

// ============= Resource Management =============

class Resource {
    private final String resourceId;
    private final ReentrantLock lock;

    public Resource(String resourceId) {
        this.resourceId = resourceId;
        this.lock = new ReentrantLock();
    }

    public ReentrantLock getLock() {
        return lock;
    }

    public String getResourceId() {
        return resourceId;
    }
}

class ResourceManager {
    /**
     * Uses resources in a safe order to prevent deadlock.
     */
    public void useResourcesSafely(Resource r1, Resource r2, String threadName)
            throws InterruptedException {
        // Order resources by ID to prevent deadlock
        Resource first = r1;
        Resource second = r2;

        if (r1.getResourceId().compareTo(r2.getResourceId()) > 0) {
            first = r2;
            second = r1;
        }

        first.getLock().lock();
        try {
            Thread.sleep(50); // Simulate work
            second.getLock().lock();
            try {
                System.out.println("  " + threadName + " using " +
                    first.getResourceId() + " and " + second.getResourceId());
                Thread.sleep(50); // Simulate work
            } finally {
                second.getLock().unlock();
            }
        } finally {
            first.getLock().unlock();
        }
    }
}

// ============= Optimistic Locking =============

class VersionedAccount {
    private final long accountId;
    private final String customerName;
    private double balance;
    private long version;
    private final ReentrantLock lock;

    public VersionedAccount(long accountId, String customerName, double initialBalance) {
        this.accountId = accountId;
        this.customerName = customerName;
        this.balance = initialBalance;
        this.version = 0;
        this.lock = new ReentrantLock();
    }

    public long getVersion() {
        return version;
    }

    public double getBalance() {
        return balance;
    }

    /**
     * Updates balance only if version matches (optimistic locking).
     */
    public boolean updateBalanceOptimistic(long expectedVersion, double amount) {
        lock.lock();
        try {
            if (version == expectedVersion) {
                balance += amount;
                version++;
                return true;
            }
            return false; // Version mismatch
        } finally {
            lock.unlock();
        }
    }
}

// ============= Timeout Handling =============

class TimeoutAccount {
    private final long accountId;
    private final String customerName;
    private double balance;
    private final ReentrantLock lock;

    public TimeoutAccount(long accountId, String customerName, double initialBalance) {
        this.accountId = accountId;
        this.customerName = customerName;
        this.balance = initialBalance;
        this.lock = new ReentrantLock();
    }

    /**
     * Performs a long-running operation while holding the lock.
     */
    public void performLongOperation() throws InterruptedException {
        lock.lock();
        try {
            System.out.println("  Long operation started");
            Thread.sleep(2000); // Hold lock for 2 seconds
            balance += 100;
            System.out.println("  Long operation completed");
        } finally {
            lock.unlock();
        }
    }

    /**
     * Tries to acquire lock with timeout.
     */
    public boolean tryOperationWithTimeout(long timeoutMs) throws InterruptedException {
        boolean acquired = lock.tryLock(timeoutMs, TimeUnit.MILLISECONDS);
        if (acquired) {
            try {
                balance += 50;
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false;
    }
}
