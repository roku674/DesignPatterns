package Enterprise.Concurrency;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Demonstrates Concurrency Patterns for Enterprise Applications.
 *
 * Key Concurrency Patterns:
 * - Optimistic Offline Lock: Prevents conflicts between concurrent business transactions
 * - Pessimistic Offline Lock: Prevents conflicts by locking records
 * - Coarse-Grained Lock: Locks a set of related objects with a single lock
 * - Implicit Lock: Executes locking implicitly to avoid explicit locking logic
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Concurrency Patterns Demo ===\n");

        // 1. Optimistic Locking
        demonstrateOptimisticLocking();

        // 2. Pessimistic Locking
        demonstratePessimisticLocking();

        // 3. Coarse-Grained Locking
        demonstrateCoarseGrainedLocking();

        // 4. Version-based Concurrency Control
        demonstrateVersionControl();

        // 5. Thread-Safe Repository
        demonstrateThreadSafeRepository();

        System.out.println("\n=== All Concurrency Patterns Demonstrated ===");
    }

    private static void demonstrateOptimisticLocking() {
        System.out.println("--- Optimistic Locking Pattern ---");
        System.out.println("Purpose: Allow concurrent reads, detect conflicts on write\n");

        OptimisticLockingRepository repository = new OptimisticLockingRepository();

        // Create account
        Account account = new Account(1L, "John Doe", 1000.0);
        repository.save(account);
        System.out.println("Created account: " + account);

        // Simulate concurrent updates
        Account account1 = repository.findById(1L);
        Account account2 = repository.findById(1L);

        System.out.println("\nSimulating concurrent updates:");
        account1.deposit(100.0);
        repository.save(account1);
        System.out.println("First update successful: balance = " + account1.getBalance());

        try {
            account2.withdraw(50.0);
            repository.save(account2);
        } catch (ConcurrentModificationException e) {
            System.out.println("Second update failed: " + e.getMessage());
            System.out.println("Optimistic lock detected conflict - transaction must retry");
        }
        System.out.println();
    }

    private static void demonstratePessimisticLocking() {
        System.out.println("--- Pessimistic Locking Pattern ---");
        System.out.println("Purpose: Lock resources before reading to prevent conflicts\n");

        PessimisticLockingRepository repository = new PessimisticLockingRepository();

        Account account = new Account(2L, "Jane Smith", 2000.0);
        repository.save(account);
        System.out.println("Created account: " + account);

        System.out.println("\nAcquiring lock for update...");
        Account lockedAccount = repository.findByIdForUpdate(2L);
        System.out.println("Lock acquired, performing update");

        lockedAccount.deposit(500.0);
        repository.save(lockedAccount);
        repository.releaseLock(2L);

        System.out.println("Update complete, lock released: balance = " + lockedAccount.getBalance());
        System.out.println();
    }

    private static void demonstrateCoarseGrainedLocking() {
        System.out.println("--- Coarse-Grained Locking Pattern ---");
        System.out.println("Purpose: Lock a group of related objects together\n");

        Customer customer = new Customer(3L, "Bob Johnson");
        CustomerAddress address = new CustomerAddress(1L, "123 Main St", customer);
        CustomerOrder order = new CustomerOrder(1L, 500.0, customer);

        CustomerAggregate aggregate = new CustomerAggregate(customer, address, order);

        System.out.println("Locking customer aggregate (customer + address + order)");
        aggregate.lock();

        System.out.println("Performing updates on all related objects:");
        customer.setName("Robert Johnson");
        address.setStreet("456 Oak Ave");
        order.setAmount(750.0);

        aggregate.unlock();
        System.out.println("All updates complete, aggregate unlocked");
        System.out.println();
    }

    private static void demonstrateVersionControl() {
        System.out.println("--- Version-Based Concurrency Control ---");
        System.out.println("Purpose: Use version numbers to detect concurrent modifications\n");

        VersionedDocument doc = new VersionedDocument(1L, "Important Document", "Initial content");
        System.out.println("Created document: " + doc.getTitle() + " (version " + doc.getVersion() + ")");

        System.out.println("\nPerforming updates:");
        doc.updateContent("Updated content 1");
        System.out.println("After update 1: version = " + doc.getVersion());

        doc.updateContent("Updated content 2");
        System.out.println("After update 2: version = " + doc.getVersion());

        doc.updateContent("Updated content 3");
        System.out.println("After update 3: version = " + doc.getVersion());
        System.out.println("Each update increments version for conflict detection");
        System.out.println();
    }

    private static void demonstrateThreadSafeRepository() {
        System.out.println("--- Thread-Safe Repository ---");
        System.out.println("Purpose: Ensure repository operations are thread-safe\n");

        ThreadSafeRepository<Product> repository = new ThreadSafeRepository<>();

        ExecutorService executor = Executors.newFixedThreadPool(3);

        System.out.println("Starting concurrent operations with 3 threads:");

        // Simulate concurrent adds
        for (int i = 1; i <= 5; i++) {
            final int id = i;
            executor.submit(() -> {
                Product product = new Product((long) id, "Product " + id, 10.0 * id);
                repository.save(product);
                System.out.println("  Thread " + Thread.currentThread().getId() +
                                 " saved: " + product.getName());
            });
        }

        executor.shutdown();
        try {
            executor.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("\nAll operations complete. Total products: " + repository.count());
        System.out.println("Repository handled concurrent access safely");
        System.out.println();
    }
}
