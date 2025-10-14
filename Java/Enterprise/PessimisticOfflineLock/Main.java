package Enterprise.PessimisticOfflineLock;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/**
 * Pessimistic Offline Lock Pattern Demonstration
 *
 * Intent: Prevents conflicts between concurrent business transactions by allowing
 * only one business transaction to access data at a time
 *
 * Use When:
 * - Long-running business transactions (spanning multiple requests)
 * - High contention for shared resources
 * - Cost of rollback is high
 * - You need to prevent lost updates
 * - Users edit data over extended periods
 *
 * Enterprise Context:
 * In enterprise applications, users often load data, make changes over time,
 * and save. Without locking, concurrent edits can cause lost updates.
 * Pessimistic locking prevents conflicts by locking resources upfront.
 */
public class Main {

    /**
     * Lock Manager - manages all pessimistic locks
     */
    static class LockManager {
        private final Map<String, Lock> locks = new ConcurrentHashMap<>();
        private final ScheduledExecutorService cleanupScheduler = Executors.newScheduledThreadPool(1);

        public LockManager() {
            // Schedule periodic cleanup of expired locks
            cleanupScheduler.scheduleAtFixedRate(this::cleanupExpiredLocks, 10, 10, TimeUnit.SECONDS);
        }

        public Lock acquireLock(String resourceId, String ownerId, LockType type, int timeoutSeconds) {
            String lockKey = getLockKey(resourceId, type);

            Lock existingLock = locks.get(lockKey);
            if (existingLock != null && !existingLock.isExpired()) {
                if (existingLock.getOwnerId().equals(ownerId)) {
                    // Same owner can reacquire
                    existingLock.extend(timeoutSeconds);
                    System.out.println("[LOCK] Extended lock on " + resourceId + " by " + ownerId);
                    return existingLock;
                } else {
                    throw new LockException("Resource " + resourceId + " is already locked by " +
                                          existingLock.getOwnerId());
                }
            }

            Lock newLock = new Lock(resourceId, ownerId, type, timeoutSeconds);
            locks.put(lockKey, newLock);
            System.out.println("[LOCK] Acquired " + type + " lock on " + resourceId + " by " + ownerId);
            return newLock;
        }

        public void releaseLock(String resourceId, String ownerId, LockType type) {
            String lockKey = getLockKey(resourceId, type);
            Lock lock = locks.get(lockKey);

            if (lock == null) {
                System.out.println("[LOCK] No lock found for " + resourceId);
                return;
            }

            if (!lock.getOwnerId().equals(ownerId)) {
                throw new LockException("Cannot release lock owned by " + lock.getOwnerId());
            }

            locks.remove(lockKey);
            System.out.println("[LOCK] Released " + type + " lock on " + resourceId + " by " + ownerId);
        }

        public boolean isLocked(String resourceId, LockType type) {
            String lockKey = getLockKey(resourceId, type);
            Lock lock = locks.get(lockKey);
            return lock != null && !lock.isExpired();
        }

        public Lock getLock(String resourceId, LockType type) {
            String lockKey = getLockKey(resourceId, type);
            return locks.get(lockKey);
        }

        private String getLockKey(String resourceId, LockType type) {
            return resourceId + ":" + type;
        }

        private void cleanupExpiredLocks() {
            List<String> expiredKeys = new ArrayList<>();
            for (Map.Entry<String, Lock> entry : locks.entrySet()) {
                if (entry.getValue().isExpired()) {
                    expiredKeys.add(entry.getKey());
                }
            }

            for (String key : expiredKeys) {
                Lock lock = locks.remove(key);
                System.out.println("[CLEANUP] Removed expired lock: " + lock.getResourceId());
            }
        }

        public int getActiveLockCount() {
            return (int) locks.values().stream().filter(l -> !l.isExpired()).count();
        }

        public void shutdown() {
            cleanupScheduler.shutdown();
        }
    }

    /**
     * Lock entity
     */
    static class Lock {
        private final String id;
        private final String resourceId;
        private final String ownerId;
        private final LockType type;
        private final LocalDateTime acquiredAt;
        private LocalDateTime expiresAt;

        public Lock(String resourceId, String ownerId, LockType type, int timeoutSeconds) {
            this.id = UUID.randomUUID().toString();
            this.resourceId = resourceId;
            this.ownerId = ownerId;
            this.type = type;
            this.acquiredAt = LocalDateTime.now();
            this.expiresAt = acquiredAt.plusSeconds(timeoutSeconds);
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }

        public void extend(int additionalSeconds) {
            this.expiresAt = LocalDateTime.now().plusSeconds(additionalSeconds);
        }

        public long getRemainingSeconds() {
            return Duration.between(LocalDateTime.now(), expiresAt).getSeconds();
        }

        // Getters
        public String getId() { return id; }
        public String getResourceId() { return resourceId; }
        public String getOwnerId() { return ownerId; }
        public LockType getType() { return type; }
        public LocalDateTime getAcquiredAt() { return acquiredAt; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
    }

    /**
     * Lock types
     */
    enum LockType {
        READ,       // Shared lock - multiple readers allowed
        WRITE,      // Exclusive lock - only one writer
        EXCLUSIVE   // Complete exclusive access
    }

    /**
     * Lock exception
     */
    static class LockException extends RuntimeException {
        public LockException(String message) {
            super(message);
        }
    }

    /**
     * Lockable entity interface
     */
    interface Lockable {
        String getResourceId();
        int getVersion();
        void incrementVersion();
    }

    /**
     * Customer entity with locking support
     */
    static class Customer implements Lockable {
        private final String id;
        private String name;
        private String email;
        private double creditLimit;
        private int version;

        public Customer(String id, String name, String email, double creditLimit) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.creditLimit = creditLimit;
            this.version = 0;
        }

        @Override
        public String getResourceId() {
            return "CUSTOMER:" + id;
        }

        @Override
        public int getVersion() {
            return version;
        }

        @Override
        public void incrementVersion() {
            this.version++;
        }

        // Business methods
        public void updateCreditLimit(double newLimit) {
            this.creditLimit = newLimit;
        }

        public void updateContactInfo(String email) {
            this.email = email;
        }

        // Getters
        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public double getCreditLimit() { return creditLimit; }
    }

    /**
     * Order entity with locking support
     */
    static class Order implements Lockable {
        private final String id;
        private final String customerId;
        private List<OrderLine> lines;
        private OrderStatus status;
        private double totalAmount;
        private int version;

        public Order(String id, String customerId) {
            this.id = id;
            this.customerId = customerId;
            this.lines = new ArrayList<>();
            this.status = OrderStatus.DRAFT;
            this.totalAmount = 0.0;
            this.version = 0;
        }

        @Override
        public String getResourceId() {
            return "ORDER:" + id;
        }

        @Override
        public int getVersion() {
            return version;
        }

        @Override
        public void incrementVersion() {
            this.version++;
        }

        public void addLine(OrderLine line) {
            lines.add(line);
            calculateTotal();
        }

        public void removeLine(OrderLine line) {
            lines.remove(line);
            calculateTotal();
        }

        private void calculateTotal() {
            totalAmount = lines.stream().mapToDouble(OrderLine::getAmount).sum();
        }

        public void submit() {
            this.status = OrderStatus.SUBMITTED;
        }

        public void approve() {
            this.status = OrderStatus.APPROVED;
        }

        // Getters
        public String getId() { return id; }
        public String getCustomerId() { return customerId; }
        public List<OrderLine> getLines() { return new ArrayList<>(lines); }
        public OrderStatus getStatus() { return status; }
        public double getTotalAmount() { return totalAmount; }
    }

    static class OrderLine {
        private final String productId;
        private int quantity;
        private double price;

        public OrderLine(String productId, int quantity, double price) {
            this.productId = productId;
            this.quantity = quantity;
            this.price = price;
        }

        public double getAmount() {
            return quantity * price;
        }

        public String getProductId() { return productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public double getPrice() { return price; }
    }

    enum OrderStatus {
        DRAFT, SUBMITTED, APPROVED, REJECTED, CANCELLED
    }

    /**
     * Inventory item with locking
     */
    static class InventoryItem implements Lockable {
        private final String productId;
        private int quantity;
        private int reserved;
        private int version;

        public InventoryItem(String productId, int quantity) {
            this.productId = productId;
            this.quantity = quantity;
            this.reserved = 0;
            this.version = 0;
        }

        @Override
        public String getResourceId() {
            return "INVENTORY:" + productId;
        }

        @Override
        public int getVersion() {
            return version;
        }

        @Override
        public void incrementVersion() {
            this.version++;
        }

        public boolean reserve(int amount) {
            if (getAvailable() >= amount) {
                reserved += amount;
                return true;
            }
            return false;
        }

        public void releaseReservation(int amount) {
            reserved = Math.max(0, reserved - amount);
        }

        public void removeStock(int amount) {
            quantity -= amount;
            reserved -= amount;
        }

        public void addStock(int amount) {
            quantity += amount;
        }

        public int getAvailable() {
            return quantity - reserved;
        }

        // Getters
        public String getProductId() { return productId; }
        public int getQuantity() { return quantity; }
        public int getReserved() { return reserved; }
    }

    /**
     * Session-aware service that uses pessimistic locking
     */
    static class OrderEditingService {
        private final LockManager lockManager;
        private final Map<String, Order> orders = new ConcurrentHashMap<>();

        public OrderEditingService(LockManager lockManager) {
            this.lockManager = lockManager;
        }

        public void addOrder(Order order) {
            orders.put(order.getId(), order);
        }

        public Order beginEdit(String orderId, String userId) {
            Order order = orders.get(orderId);
            if (order == null) {
                throw new IllegalArgumentException("Order not found: " + orderId);
            }

            // Acquire write lock before allowing edit
            lockManager.acquireLock(order.getResourceId(), userId, LockType.WRITE, 300);
            System.out.println("[EDIT] User " + userId + " started editing order " + orderId);
            return order;
        }

        public void saveChanges(String orderId, String userId) {
            Order order = orders.get(orderId);
            if (order == null) {
                throw new IllegalArgumentException("Order not found: " + orderId);
            }

            Lock lock = lockManager.getLock(order.getResourceId(), LockType.WRITE);
            if (lock == null || !lock.getOwnerId().equals(userId)) {
                throw new LockException("User " + userId + " does not have write lock");
            }

            order.incrementVersion();
            System.out.println("[SAVE] Order " + orderId + " saved, version now " + order.getVersion());
        }

        public void endEdit(String orderId, String userId) {
            Order order = orders.get(orderId);
            if (order == null) {
                throw new IllegalArgumentException("Order not found: " + orderId);
            }

            lockManager.releaseLock(order.getResourceId(), userId, LockType.WRITE);
            System.out.println("[EDIT] User " + userId + " finished editing order " + orderId);
        }
    }

    /**
     * Repository with pessimistic locking
     */
    static class LockableRepository<T extends Lockable> {
        private final Map<String, T> storage = new ConcurrentHashMap<>();
        private final LockManager lockManager;

        public LockableRepository(LockManager lockManager) {
            this.lockManager = lockManager;
        }

        public void save(T entity) {
            storage.put(entity.getResourceId(), entity);
        }

        public T load(String resourceId, String userId, LockType lockType) {
            T entity = storage.get(resourceId);
            if (entity == null) {
                return null;
            }

            lockManager.acquireLock(resourceId, userId, lockType, 300);
            return entity;
        }

        public void update(T entity, String userId) {
            Lock lock = lockManager.getLock(entity.getResourceId(), LockType.WRITE);
            if (lock == null || !lock.getOwnerId().equals(userId)) {
                throw new LockException("Cannot update without write lock");
            }

            entity.incrementVersion();
            storage.put(entity.getResourceId(), entity);
            System.out.println("[UPDATE] " + entity.getResourceId() +
                             " updated to version " + entity.getVersion());
        }

        public void release(String resourceId, String userId, LockType lockType) {
            lockManager.releaseLock(resourceId, userId, lockType);
        }

        public T get(String resourceId) {
            return storage.get(resourceId);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Pessimistic Offline Lock Pattern Demo ===\n");

        LockManager lockManager = new LockManager();

        // Scenario 1: Basic Lock Acquisition and Release
        System.out.println("--- Scenario 1: Basic Locking ---");
        Customer customer1 = new Customer("C001", "John Doe", "john@example.com", 5000.0);
        Lock lock1 = lockManager.acquireLock(customer1.getResourceId(), "user1",
                                            LockType.WRITE, 60);
        System.out.println("Lock ID: " + lock1.getId());
        System.out.println("Expires in: " + lock1.getRemainingSeconds() + " seconds");

        // Simulate some work
        customer1.updateCreditLimit(7500.0);
        System.out.println("Updated credit limit to: $" + customer1.getCreditLimit());

        lockManager.releaseLock(customer1.getResourceId(), "user1", LockType.WRITE);

        // Scenario 2: Lock Conflict
        System.out.println("\n--- Scenario 2: Lock Conflict ---");
        Customer customer2 = new Customer("C002", "Jane Smith", "jane@example.com", 3000.0);
        lockManager.acquireLock(customer2.getResourceId(), "user1", LockType.WRITE, 60);

        try {
            lockManager.acquireLock(customer2.getResourceId(), "user2", LockType.WRITE, 60);
            System.out.println("ERROR: Should not reach here!");
        } catch (LockException e) {
            System.out.println("Lock conflict detected: " + e.getMessage());
        }

        lockManager.releaseLock(customer2.getResourceId(), "user1", LockType.WRITE);

        // Scenario 3: Lock Extension
        System.out.println("\n--- Scenario 3: Lock Extension ---");
        Lock lock3 = lockManager.acquireLock(customer1.getResourceId(), "user1",
                                            LockType.WRITE, 30);
        System.out.println("Initial expiry: " + lock3.getRemainingSeconds() + " seconds");

        lock3.extend(60);
        System.out.println("After extension: " + lock3.getRemainingSeconds() + " seconds");

        lockManager.releaseLock(customer1.getResourceId(), "user1", LockType.WRITE);

        // Scenario 4: Order Editing Service
        System.out.println("\n--- Scenario 4: Order Editing ---");
        OrderEditingService orderService = new OrderEditingService(lockManager);

        Order order1 = new Order("ORD001", "C001");
        order1.addLine(new OrderLine("PROD001", 2, 50.0));
        orderService.addOrder(order1);

        Order editableOrder = orderService.beginEdit("ORD001", "user1");
        editableOrder.addLine(new OrderLine("PROD002", 1, 75.0));
        System.out.println("Order total: $" + editableOrder.getTotalAmount());

        orderService.saveChanges("ORD001", "user1");
        orderService.endEdit("ORD001", "user1");

        // Scenario 5: Concurrent Edit Attempt
        System.out.println("\n--- Scenario 5: Concurrent Edit Prevention ---");
        Order order2 = new Order("ORD002", "C002");
        orderService.addOrder(order2);

        orderService.beginEdit("ORD002", "user1");

        try {
            orderService.beginEdit("ORD002", "user2");
            System.out.println("ERROR: Should not reach here!");
        } catch (LockException e) {
            System.out.println("Concurrent edit blocked: " + e.getMessage());
        }

        orderService.endEdit("ORD002", "user1");

        // Scenario 6: Repository with Locking
        System.out.println("\n--- Scenario 6: Lockable Repository ---");
        LockableRepository<Customer> customerRepo = new LockableRepository<>(lockManager);

        Customer customer3 = new Customer("C003", "Bob Johnson", "bob@example.com", 4000.0);
        customerRepo.save(customer3);

        Customer loaded = customerRepo.load(customer3.getResourceId(), "user1", LockType.WRITE);
        System.out.println("Loaded customer: " + loaded.getName());

        loaded.updateCreditLimit(6000.0);
        customerRepo.update(loaded, "user1");
        customerRepo.release(loaded.getResourceId(), "user1", LockType.WRITE);

        // Scenario 7: Inventory Management
        System.out.println("\n--- Scenario 7: Inventory Locking ---");
        LockableRepository<InventoryItem> inventoryRepo = new LockableRepository<>(lockManager);

        InventoryItem item1 = new InventoryItem("PROD001", 100);
        inventoryRepo.save(item1);

        InventoryItem loadedItem = inventoryRepo.load(item1.getResourceId(), "warehouse-sys",
                                                      LockType.WRITE);
        System.out.println("Available stock: " + loadedItem.getAvailable());

        boolean reserved = loadedItem.reserve(10);
        System.out.println("Reserved 10 units: " + reserved);
        System.out.println("Available after reservation: " + loadedItem.getAvailable());

        inventoryRepo.update(loadedItem, "warehouse-sys");
        inventoryRepo.release(loadedItem.getResourceId(), "warehouse-sys", LockType.WRITE);

        // Scenario 8: Multiple Users Sequential Access
        System.out.println("\n--- Scenario 8: Sequential Access ---");
        Order order3 = new Order("ORD003", "C003");
        orderService.addOrder(order3);

        System.out.println("User1 editing...");
        Order edit1 = orderService.beginEdit("ORD003", "user1");
        edit1.addLine(new OrderLine("PROD001", 1, 50.0));
        orderService.saveChanges("ORD003", "user1");
        orderService.endEdit("ORD003", "user1");

        System.out.println("User2 editing...");
        Order edit2 = orderService.beginEdit("ORD003", "user2");
        edit2.addLine(new OrderLine("PROD002", 2, 30.0));
        orderService.saveChanges("ORD003", "user2");
        orderService.endEdit("ORD003", "user2");

        System.out.println("Final order version: " + order3.getVersion());
        System.out.println("Final order total: $" + order3.getTotalAmount());

        // Scenario 9: Lock Status Checking
        System.out.println("\n--- Scenario 9: Lock Status ---");
        Customer customer4 = new Customer("C004", "Alice Brown", "alice@example.com", 8000.0);
        customerRepo.save(customer4);

        System.out.println("Is locked (before): " +
            lockManager.isLocked(customer4.getResourceId(), LockType.WRITE));

        customerRepo.load(customer4.getResourceId(), "user1", LockType.WRITE);

        System.out.println("Is locked (after): " +
            lockManager.isLocked(customer4.getResourceId(), LockType.WRITE));

        Lock activeLock = lockManager.getLock(customer4.getResourceId(), LockType.WRITE);
        System.out.println("Lock owner: " + activeLock.getOwnerId());
        System.out.println("Time remaining: " + activeLock.getRemainingSeconds() + "s");

        customerRepo.release(customer4.getResourceId(), "user1", LockType.WRITE);

        // Scenario 10: Version Tracking
        System.out.println("\n--- Scenario 10: Version Tracking ---");
        Order order4 = new Order("ORD004", "C004");
        orderService.addOrder(order4);

        System.out.println("Initial version: " + order4.getVersion());

        for (int i = 1; i <= 3; i++) {
            orderService.beginEdit("ORD004", "user1");
            order4.addLine(new OrderLine("PROD" + i, 1, 25.0));
            orderService.saveChanges("ORD004", "user1");
            orderService.endEdit("ORD004", "user1");
            System.out.println("After edit " + i + ", version: " + order4.getVersion());
        }

        // Scenario 11: Lock Statistics
        System.out.println("\n--- Scenario 11: Lock Manager Statistics ---");
        System.out.println("Active locks: " + lockManager.getActiveLockCount());

        // Create some locks for statistics
        for (int i = 1; i <= 5; i++) {
            Customer c = new Customer("C10" + i, "User" + i, "user" + i + "@example.com", 1000.0);
            lockManager.acquireLock(c.getResourceId(), "user" + i, LockType.WRITE, 60);
        }

        System.out.println("Active locks after batch: " + lockManager.getActiveLockCount());

        // Summary
        System.out.println("\n--- Summary ---");
        System.out.println("Total active locks: " + lockManager.getActiveLockCount());
        System.out.println("Order versions tracked");
        System.out.println("Conflicts prevented");

        // Cleanup
        lockManager.shutdown();

        System.out.println("\n=== Benefits of Pessimistic Offline Lock ===");
        System.out.println("1. Prevents lost updates in long-running transactions");
        System.out.println("2. Makes conflicts explicit and immediate");
        System.out.println("3. Ensures data consistency across sessions");
        System.out.println("4. Avoids costly rollbacks and conflict resolution");
        System.out.println("5. Clear ownership of resources during editing");

        System.out.println("\nPattern demonstration complete.");
    }
}
