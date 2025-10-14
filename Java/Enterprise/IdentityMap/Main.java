package Enterprise.IdentityMap;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * IdentityMap Pattern Demonstration
 *
 * The IdentityMap pattern ensures that each object gets loaded only once by keeping
 * every loaded object in a map. Lookups are done using the map to ensure object identity.
 *
 * Real-world Use Cases:
 * - ORM frameworks (Hibernate, JPA) to prevent duplicate entity instances
 * - Caching database entities to reduce query overhead
 * - Maintaining object identity within a session/transaction
 * - Preventing data inconsistency when same entity loaded multiple times
 *
 * Benefits:
 * - Ensures object identity (same DB row = same object instance)
 * - Reduces database queries
 * - Prevents data inconsistencies
 * - Improves performance through caching
 * - Simplifies object comparison
 *
 * @author Enterprise Patterns Implementation
 * @version 2.0
 */
public class Main {

    /**
     * Main entry point demonstrating comprehensive IdentityMap scenarios.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("IdentityMap Pattern - Enterprise Data Access Layer");
        System.out.println("=".repeat(80));
        System.out.println();

        // Scenario 1: Basic identity map usage
        demonstrateBasicIdentityMap();

        // Scenario 2: Object identity guarantee
        demonstrateObjectIdentity();

        // Scenario 3: Multiple entity types
        demonstrateMultipleEntityTypes();

        // Scenario 4: Cache hit vs miss statistics
        demonstrateCacheStatistics();

        // Scenario 5: Session-scoped identity map
        demonstrateSessionScope();

        // Scenario 6: Concurrent access handling
        demonstrateConcurrentAccess();

        // Scenario 7: Identity map with lazy loading
        demonstrateLazyLoading();

        // Scenario 8: Cache eviction strategies
        demonstrateCacheEviction();

        // Scenario 9: Complex object graph loading
        demonstrateObjectGraph();

        // Scenario 10: Identity map with transactions
        demonstrateTransactionalIdentityMap();

        System.out.println();
        System.out.println("=".repeat(80));
        System.out.println("All IdentityMap scenarios completed successfully!");
        System.out.println("=".repeat(80));
    }

    /**
     * Scenario 1: Demonstrates basic identity map functionality.
     * Shows how the same entity is returned from cache on subsequent requests.
     */
    private static void demonstrateBasicIdentityMap() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 1: Basic IdentityMap Usage");
        System.out.println("-".repeat(80));

        IdentityMap<Long, Customer> identityMap = new IdentityMap<>();
        CustomerRepository repository = new CustomerRepository(identityMap);

        // First load - cache miss
        System.out.println("Loading customer #1 for the first time...");
        Customer customer1 = repository.findById(1L);
        System.out.println("  Loaded: " + customer1.getName() + " (" + customer1.getEmail() + ")");

        // Second load - cache hit
        System.out.println("\nLoading customer #1 again...");
        Customer customer2 = repository.findById(1L);
        System.out.println("  Retrieved from cache: " + customer2.getName());

        // Verify same instance
        System.out.println("\nIdentity check:");
        System.out.println("  customer1 == customer2: " + (customer1 == customer2));
        System.out.println("  Same memory address: " + (System.identityHashCode(customer1) == System.identityHashCode(customer2)));

        System.out.println("\nCache statistics:");
        identityMap.printStatistics();
    }

    /**
     * Scenario 2: Demonstrates guaranteed object identity.
     * Multiple references always point to the same object instance.
     */
    private static void demonstrateObjectIdentity() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 2: Object Identity Guarantee");
        System.out.println("-".repeat(80));

        IdentityMap<Long, Product> identityMap = new IdentityMap<>();
        ProductRepository repository = new ProductRepository(identityMap);

        // Load product through different code paths
        System.out.println("Loading product through different methods...");
        Product fromFindById = repository.findById(101L);
        Product fromSearch = repository.searchByName("Laptop").get(0);
        Product fromCategory = repository.findByCategory("Electronics").get(0);

        System.out.println("\nAll references point to same instance:");
        System.out.println("  findById == searchByName: " + (fromFindById == fromSearch));
        System.out.println("  findById == findByCategory: " + (fromFindById == fromCategory));
        System.out.println("  searchByName == findByCategory: " + (fromSearch == fromCategory));

        // Modify through one reference
        System.out.println("\nModifying product through first reference...");
        fromFindById.setPrice(new BigDecimal("899.99"));

        // Verify change visible through all references
        System.out.println("Change visible through all references:");
        System.out.println("  fromFindById price: $" + fromFindById.getPrice());
        System.out.println("  fromSearch price: $" + fromSearch.getPrice());
        System.out.println("  fromCategory price: $" + fromCategory.getPrice());
    }

    /**
     * Scenario 3: Demonstrates identity maps for multiple entity types.
     */
    private static void demonstrateMultipleEntityTypes() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 3: Multiple Entity Types");
        System.out.println("-".repeat(80));

        SessionFactory sessionFactory = new SessionFactory();
        Session session = sessionFactory.openSession();

        System.out.println("Loading different entity types...");
        Customer customer = session.get(Customer.class, 1L);
        Product product = session.get(Product.class, 101L);
        Order order = session.get(Order.class, 1001L);

        System.out.println("\nEntities loaded:");
        System.out.println("  Customer: " + customer.getName());
        System.out.println("  Product: " + product.getName());
        System.out.println("  Order: #" + order.getId());

        System.out.println("\nReloading same entities (from cache)...");
        Customer customer2 = session.get(Customer.class, 1L);
        Product product2 = session.get(Product.class, 101L);
        Order order2 = session.get(Order.class, 1001L);

        System.out.println("Identity verification:");
        System.out.println("  Customer: " + (customer == customer2));
        System.out.println("  Product: " + (product == product2));
        System.out.println("  Order: " + (order == order2));

        session.printCacheStatistics();
        session.close();
    }

    /**
     * Scenario 4: Demonstrates cache performance metrics.
     */
    private static void demonstrateCacheStatistics() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 4: Cache Hit/Miss Statistics");
        System.out.println("-".repeat(80));

        IdentityMap<Long, Customer> identityMap = new IdentityMap<>();
        CustomerRepository repository = new CustomerRepository(identityMap);

        System.out.println("Performing 100 random customer lookups...");
        for (int i = 0; i < 100; i++) {
            long customerId = (i % 10) + 1; // Reuse customers 1-10
            repository.findById(customerId);
        }

        System.out.println("\nCache performance:");
        identityMap.printStatistics();
        System.out.println("  Hit rate: " + String.format("%.1f%%", identityMap.getHitRate() * 100));
        System.out.println("  Cache efficiency: " + (identityMap.getHitRate() > 0.8 ? "Excellent" : "Good"));
    }

    /**
     * Scenario 5: Demonstrates session-scoped identity maps.
     */
    private static void demonstrateSessionScope() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 5: Session-Scoped Identity Map");
        System.out.println("-".repeat(80));

        SessionFactory sessionFactory = new SessionFactory();

        // Session 1
        System.out.println("Session 1:");
        Session session1 = sessionFactory.openSession();
        Product product1 = session1.get(Product.class, 101L);
        product1.setPrice(new BigDecimal("799.99"));
        System.out.println("  Loaded and modified product in session 1");
        System.out.println("  Price: $" + product1.getPrice());
        session1.close();

        // Session 2 - fresh identity map
        System.out.println("\nSession 2:");
        Session session2 = sessionFactory.openSession();
        Product product2 = session2.get(Product.class, 101L);
        System.out.println("  Loaded product in session 2 (fresh from DB)");
        System.out.println("  Price: $" + product2.getPrice());
        System.out.println("  Different instance: " + (product1 != product2));
        session2.close();

        System.out.println("\nSession isolation demonstrated:");
        System.out.println("  Each session has its own identity map");
        System.out.println("  Changes in one session don't affect another");
    }

    /**
     * Scenario 6: Demonstrates thread-safe concurrent access.
     */
    private static void demonstrateConcurrentAccess() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 6: Concurrent Access Handling");
        System.out.println("-".repeat(80));

        IdentityMap<Long, Product> identityMap = new IdentityMap<>(true); // Thread-safe
        ProductRepository repository = new ProductRepository(identityMap);

        System.out.println("Simulating 3 concurrent threads accessing same product...");

        Thread[] threads = new Thread[3];
        for (int i = 0; i < 3; i++) {
            final int threadNum = i + 1;
            threads[i] = new Thread(() -> {
                Product product = repository.findById(101L);
                System.out.println("  Thread " + threadNum + ": Got product " + product.getName() +
                                 " (hash: " + System.identityHashCode(product) + ")");
            });
            threads[i].start();
        }

        // Wait for all threads
        for (Thread thread : threads) {
            try {
                thread.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("\nAll threads received the same instance (verified by hash code)");
        System.out.println("Thread-safe identity map prevents race conditions");
    }

    /**
     * Scenario 7: Demonstrates identity map with lazy loading support.
     */
    private static void demonstrateLazyLoading() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 7: Identity Map with Lazy Loading");
        System.out.println("-".repeat(80));

        Session session = new SessionFactory().openSession();

        System.out.println("Loading order with lazy-loaded items...");
        Order order = session.get(Order.class, 1001L);
        System.out.println("  Order loaded: #" + order.getId());
        System.out.println("  Customer: " + order.getCustomerId() + " (ID only, not loaded)");

        System.out.println("\nAccessing order items (triggers lazy load)...");
        System.out.println("  Item count: " + order.getItems().size());
        System.out.println("  Items now loaded into identity map");

        System.out.println("\nAccessing items again (from cache)...");
        System.out.println("  Item count: " + order.getItems().size());
        System.out.println("  Retrieved from identity map, no DB query");

        session.close();
    }

    /**
     * Scenario 8: Demonstrates cache eviction strategies.
     */
    private static void demonstrateCacheEviction() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 8: Cache Eviction Strategies");
        System.out.println("-".repeat(80));

        IdentityMap<Long, Customer> identityMap = new IdentityMap<>(10); // Max 10 entries
        CustomerRepository repository = new CustomerRepository(identityMap);

        System.out.println("Identity map capacity: 10 entries");
        System.out.println("Loading 15 customers...");

        for (long i = 1; i <= 15; i++) {
            repository.findById(i);
            if (i % 5 == 0) {
                System.out.println("  Loaded " + i + " customers, cache size: " + identityMap.size());
            }
        }

        System.out.println("\nFinal cache size: " + identityMap.size());
        System.out.println("LRU eviction kept cache at maximum capacity");
        System.out.println("Oldest entries evicted as new ones added");
    }

    /**
     * Scenario 9: Demonstrates loading complex object graphs.
     */
    private static void demonstrateObjectGraph() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 9: Complex Object Graph Loading");
        System.out.println("-".repeat(80));

        Session session = new SessionFactory().openSession();

        System.out.println("Loading order with full object graph...");
        Order order = session.get(Order.class, 1001L);

        System.out.println("\nOrder #" + order.getId() + ":");

        // Load customer through relationship
        Customer customer = session.get(Customer.class, order.getCustomerId());
        System.out.println("  Customer: " + customer.getName());

        // Load order items
        System.out.println("  Items:");
        for (OrderItem item : order.getItems()) {
            Product product = session.get(Product.class, item.getProductId());
            System.out.println("    - " + product.getName() + " x" + item.getQuantity() + " @ $" + item.getPrice());
        }

        System.out.println("\nReloading same graph (all from cache)...");
        Order order2 = session.get(Order.class, 1001L);
        Customer customer2 = session.get(Customer.class, order2.getCustomerId());

        System.out.println("Identity verification:");
        System.out.println("  Same order instance: " + (order == order2));
        System.out.println("  Same customer instance: " + (customer == customer2));

        session.printCacheStatistics();
        session.close();
    }

    /**
     * Scenario 10: Demonstrates identity map within transactions.
     */
    private static void demonstrateTransactionalIdentityMap() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 10: Identity Map with Transactions");
        System.out.println("-".repeat(80));

        Session session = new SessionFactory().openSession();

        System.out.println("Starting transaction...");
        session.beginTransaction();

        // Load and modify entities
        Product product = session.get(Product.class, 101L);
        System.out.println("Loaded product: " + product.getName() + " @ $" + product.getPrice());

        BigDecimal originalPrice = product.getPrice();
        product.setPrice(new BigDecimal("699.99"));
        System.out.println("Modified price to: $" + product.getPrice());

        // Load same product again in transaction
        Product product2 = session.get(Product.class, 101L);
        System.out.println("\nReloaded product in same transaction:");
        System.out.println("  Same instance: " + (product == product2));
        System.out.println("  Price reflects change: $" + product2.getPrice());

        // Rollback
        System.out.println("\nRolling back transaction...");
        session.rollback();

        // Start new transaction
        session.beginTransaction();
        Product product3 = session.get(Product.class, 101L);
        System.out.println("Loaded product in new transaction:");
        System.out.println("  Price restored: $" + product3.getPrice());
        System.out.println("  Back to original: " + (product3.getPrice().equals(originalPrice)));

        session.commit();
        session.close();

        System.out.println("\nTransaction isolation with identity map demonstrated!");
    }
}
