package Enterprise.RepositoryPattern;

import java.util.*;
import java.math.BigDecimal;
import java.util.stream.Collectors;

/**
 * Repository Pattern Demonstration
 *
 * The Repository pattern mediates between the domain and data mapping layers using a
 * collection-like interface for accessing domain objects. It provides a more object-oriented
 * view of the persistence layer and minimizes duplicate query logic.
 *
 * Key Concepts:
 * - Encapsulates persistence logic
 * - Provides collection-like interface
 * - Supports domain-driven design
 * - Centralized query logic
 * - Domain objects remain persistence-ignorant
 *
 * Types:
 * 1. Collection-Oriented: Domain objects managed like in-memory collection
 * 2. Persistence-Oriented: Explicit save/delete operations
 *
 * Advantages:
 * - Centralized data access logic
 * - Easier to test (mock repositories)
 * - Separates domain from persistence concerns
 * - Supports multiple data sources
 * - Reduces code duplication
 *
 * Disadvantages:
 * - Additional layer of abstraction
 * - Can lead to inefficient queries if not careful
 * - May duplicate Data Mapper functionality
 *
 * Real-world use cases:
 * - Domain-Driven Design applications
 * - Systems with complex querying needs
 * - Multi-data source applications
 * - Applications requiring easy testing
 * - Microservices with bounded contexts
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Repository Pattern Demo ===\n");

        demonstrateBasicOperations();
        demonstrateQueryMethods();
        demonstrateSpecificationPattern();
        demonstrateUnitOfWorkIntegration();
        demonstrateGenericRepository();
        demonstrateCachingRepository();
        demonstrateCompositeRepository();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates basic CRUD operations through repository.
     */
    private static void demonstrateBasicOperations() {
        System.out.println("--- Basic Repository Operations ---");

        UserRepository userRepository = new InMemoryUserRepository();

        // Create
        User alice = new User("alice", "alice@example.com");
        User bob = new User("bob", "bob@example.com");
        User charlie = new User("charlie", "charlie@example.com");

        userRepository.save(alice);
        userRepository.save(bob);
        userRepository.save(charlie);
        System.out.println("Created " + userRepository.count() + " users");

        // Read
        Optional<User> found = userRepository.findById(alice.getId());
        System.out.println("Found by ID: " + found.map(User::getUsername).orElse("Not found"));

        // Update
        alice.setEmail("alice.new@example.com");
        userRepository.save(alice);
        System.out.println("Updated: " + alice.getEmail());

        // Delete
        userRepository.delete(bob);
        System.out.println("Remaining users: " + userRepository.count());

        // Find all
        List<User> all = userRepository.findAll();
        System.out.println("All users: " + all.stream()
            .map(User::getUsername)
            .collect(Collectors.joining(", ")));
    }

    /**
     * Demonstrates rich query methods in repository.
     */
    private static void demonstrateQueryMethods() {
        System.out.println("\n--- Query Methods ---");

        UserRepository userRepository = new InMemoryUserRepository();

        // Setup test data
        User user1 = new User("john", "john@example.com");
        user1.setActive(true);
        user1.setRole("ADMIN");

        User user2 = new User("jane", "jane@example.com");
        user2.setActive(true);
        user2.setRole("USER");

        User user3 = new User("inactive", "inactive@example.com");
        user3.setActive(false);
        user3.setRole("USER");

        userRepository.save(user1);
        userRepository.save(user2);
        userRepository.save(user3);

        // Find by username
        Optional<User> byUsername = userRepository.findByUsername("john");
        System.out.println("By username: " + byUsername.map(User::getEmail).orElse("Not found"));

        // Find by email
        Optional<User> byEmail = userRepository.findByEmail("jane@example.com");
        System.out.println("By email: " + byEmail.map(User::getUsername).orElse("Not found"));

        // Find active users
        List<User> activeUsers = userRepository.findActiveUsers();
        System.out.println("Active users: " + activeUsers.size());

        // Find by role
        List<User> admins = userRepository.findByRole("ADMIN");
        System.out.println("Admins: " + admins.size());

        // Find by email domain
        List<User> exampleUsers = userRepository.findByEmailDomain("example.com");
        System.out.println("Users @example.com: " + exampleUsers.size());

        // Custom query
        List<User> recentActive = userRepository.findRecentActiveUsers(30);
        System.out.println("Recent active: " + recentActive.size());
    }

    /**
     * Demonstrates Specification pattern with repository.
     */
    private static void demonstrateSpecificationPattern() {
        System.out.println("\n--- Specification Pattern ---");

        UserRepository userRepository = new InMemoryUserRepository();

        // Setup data
        for (int i = 1; i <= 10; i++) {
            User user = new User("user" + i, "user" + i + "@example.com");
            user.setActive(i % 2 == 0);
            user.setRole(i <= 5 ? "USER" : "ADMIN");
            user.setCreatedAt(new Date());
            userRepository.save(user);
        }

        // Simple specification
        UserSpecification activeSpec = new ActiveUserSpecification();
        List<User> active = userRepository.findBySpecification(activeSpec);
        System.out.println("Active users (spec): " + active.size());

        // Composite specification (AND)
        UserSpecification adminSpec = new RoleSpecification("ADMIN");
        UserSpecification activeAdminSpec = activeSpec.and(adminSpec);
        List<User> activeAdmins = userRepository.findBySpecification(activeAdminSpec);
        System.out.println("Active admins: " + activeAdmins.size());

        // Composite specification (OR)
        UserSpecification inactiveSpec = new InactiveUserSpecification();
        UserSpecification activeOrInactiveSpec = activeSpec.or(inactiveSpec);
        List<User> all = userRepository.findBySpecification(activeOrInactiveSpec);
        System.out.println("Active OR inactive: " + all.size());

        // NOT specification
        UserSpecification notAdminSpec = adminSpec.not();
        List<User> nonAdmins = userRepository.findBySpecification(notAdminSpec);
        System.out.println("Non-admins: " + nonAdmins.size());

        // Complex specification
        UserSpecification complexSpec = new ActiveUserSpecification()
            .and(new EmailDomainSpecification("example.com"))
            .and(new RoleSpecification("USER").not());
        List<User> complex = userRepository.findBySpecification(complexSpec);
        System.out.println("Complex query: " + complex.size());
    }

    /**
     * Demonstrates Unit of Work integration.
     */
    private static void demonstrateUnitOfWorkIntegration() {
        System.out.println("\n--- Unit of Work Integration ---");

        UserRepository userRepository = new InMemoryUserRepository();
        UnitOfWork unitOfWork = new UnitOfWork();

        // Register changes
        User newUser = new User("newuser", "new@example.com");
        unitOfWork.registerNew(newUser);

        User existingUser = userRepository.findById(1L).orElse(null);
        if (existingUser != null) {
            existingUser.setEmail("updated@example.com");
            unitOfWork.registerDirty(existingUser);
        }

        User toDelete = userRepository.findById(2L).orElse(null);
        if (toDelete != null) {
            unitOfWork.registerDeleted(toDelete);
        }

        System.out.println("Unit of Work registered:");
        System.out.println("  New: 1");
        System.out.println("  Modified: " + (existingUser != null ? "1" : "0"));
        System.out.println("  Deleted: " + (toDelete != null ? "1" : "0"));

        // Commit through repository
        unitOfWork.commit(userRepository);
        System.out.println("Changes committed through repository");
    }

    /**
     * Demonstrates generic repository pattern.
     */
    private static void demonstrateGenericRepository() {
        System.out.println("\n--- Generic Repository ---");

        // User repository
        GenericRepository<User, Long> userRepo = new GenericRepository<>(User.class);
        User user = new User("generic", "generic@example.com");
        userRepo.save(user);
        System.out.println("Saved user via generic repo");

        // Product repository
        GenericRepository<Product, Long> productRepo = new GenericRepository<>(Product.class);
        Product product = new Product("SKU-001", "Widget", new BigDecimal("99.99"));
        productRepo.save(product);
        System.out.println("Saved product via generic repo");

        // Order repository
        GenericRepository<Order, Long> orderRepo = new GenericRepository<>(Order.class);
        Order order = new Order(1L, new Date());
        orderRepo.save(order);
        System.out.println("Saved order via generic repo");

        // Count all
        System.out.println("Users: " + userRepo.count());
        System.out.println("Products: " + productRepo.count());
        System.out.println("Orders: " + orderRepo.count());
    }

    /**
     * Demonstrates caching repository decorator.
     */
    private static void demonstrateCachingRepository() {
        System.out.println("\n--- Caching Repository ---");

        UserRepository baseRepo = new InMemoryUserRepository();
        UserRepository cachedRepo = new CachingUserRepository(baseRepo);

        // First access - cache miss
        User user = new User("cached", "cached@example.com");
        cachedRepo.save(user);

        long start = System.nanoTime();
        Optional<User> firstAccess = cachedRepo.findById(user.getId());
        long firstTime = System.nanoTime() - start;
        System.out.println("First access (cache miss): " + firstTime + "ns");

        // Second access - cache hit
        start = System.nanoTime();
        Optional<User> secondAccess = cachedRepo.findById(user.getId());
        long secondTime = System.nanoTime() - start;
        System.out.println("Second access (cache hit): " + secondTime + "ns");
        System.out.println("Speedup: " + (firstTime / Math.max(secondTime, 1)) + "x");

        // Invalidate cache on update
        user.setEmail("updated@example.com");
        cachedRepo.save(user);
        System.out.println("Cache invalidated on update");

        // Clear cache
        ((CachingUserRepository) cachedRepo).clearCache();
        System.out.println("Cache cleared");
    }

    /**
     * Demonstrates composite repository pattern.
     */
    private static void demonstrateCompositeRepository() {
        System.out.println("\n--- Composite Repository ---");

        // Multiple data sources
        UserRepository memoryRepo = new InMemoryUserRepository();
        UserRepository cacheRepo = new CachedUserRepository();
        UserRepository dbRepo = new DatabaseUserRepository();

        // Composite repository checks multiple sources
        CompositeUserRepository compositeRepo = new CompositeUserRepository();
        compositeRepo.addRepository(cacheRepo);
        compositeRepo.addRepository(memoryRepo);
        compositeRepo.addRepository(dbRepo);

        // Find - checks cache first, then memory, then database
        Optional<User> user = compositeRepo.findById(1L);
        System.out.println("Found via composite: " + user.map(User::getUsername).orElse("Not found"));

        // Save - writes to all repositories
        User newUser = new User("composite", "composite@example.com");
        compositeRepo.save(newUser);
        System.out.println("Saved to all repositories in composite");

        // Statistics
        System.out.println("Repositories in composite: " + compositeRepo.getRepositoryCount());
    }

    /**
     * Demonstrates real-world scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        System.out.println("\n1. E-commerce Product Catalog:");
        demonstrateProductCatalog();

        System.out.println("\n2. Order Management:");
        demonstrateOrderManagement();

        System.out.println("\n3. Customer Relationship Management:");
        demonstrateCRM();

        System.out.println("\n4. Content Management System:");
        demonstrateCMS();

        System.out.println("\n5. Multi-Tenant Application:");
        demonstrateMultiTenant();
    }

    private static void demonstrateProductCatalog() {
        ProductRepository productRepo = new InMemoryProductRepository();

        // Add products
        Product laptop = new Product("LAPTOP-001", "Gaming Laptop", new BigDecimal("1299.99"));
        laptop.setCategory("ELECTRONICS");
        laptop.setStockQuantity(50);
        laptop.setActive(true);

        Product mouse = new Product("MOUSE-001", "Wireless Mouse", new BigDecimal("29.99"));
        mouse.setCategory("ACCESSORIES");
        mouse.setStockQuantity(200);
        mouse.setActive(true);

        productRepo.save(laptop);
        productRepo.save(mouse);

        // Query products
        List<Product> electronics = productRepo.findByCategory("ELECTRONICS");
        System.out.println("   Electronics: " + electronics.size());

        List<Product> inStock = productRepo.findInStock();
        System.out.println("   In stock: " + inStock.size());

        List<Product> priceRange = productRepo.findByPriceRange(
            new BigDecimal("20.00"),
            new BigDecimal("50.00")
        );
        System.out.println("   Price range $20-50: " + priceRange.size());

        // Search
        List<Product> searchResults = productRepo.search("Wireless");
        System.out.println("   Search 'Wireless': " + searchResults.size());

        // Low stock alert
        List<Product> lowStock = productRepo.findLowStock(10);
        System.out.println("   Low stock: " + lowStock.size());
    }

    private static void demonstrateOrderManagement() {
        OrderRepository orderRepo = new InMemoryOrderRepository();

        // Create orders
        Order order1 = new Order(1L, new Date());
        order1.setStatus("PENDING");
        order1.setTotal(new BigDecimal("199.99"));

        Order order2 = new Order(1L, new Date());
        order2.setStatus("SHIPPED");
        order2.setTotal(new BigDecimal("299.99"));

        Order order3 = new Order(2L, new Date());
        order3.setStatus("DELIVERED");
        order3.setTotal(new BigDecimal("149.99"));

        orderRepo.save(order1);
        orderRepo.save(order2);
        orderRepo.save(order3);

        // Query orders
        List<Order> customerOrders = orderRepo.findByCustomerId(1L);
        System.out.println("   Customer 1 orders: " + customerOrders.size());

        List<Order> pendingOrders = orderRepo.findByStatus("PENDING");
        System.out.println("   Pending orders: " + pendingOrders.size());

        List<Order> recentOrders = orderRepo.findRecentOrders(30);
        System.out.println("   Recent orders (30 days): " + recentOrders.size());

        // Aggregations
        BigDecimal totalRevenue = orderRepo.calculateTotalRevenue();
        System.out.println("   Total revenue: $" + totalRevenue);

        BigDecimal avgOrderValue = orderRepo.calculateAverageOrderValue();
        System.out.println("   Average order value: $" + avgOrderValue);
    }

    private static void demonstrateCRM() {
        CustomerRepository customerRepo = new InMemoryCustomerRepository();

        // Add customers
        Customer customer1 = new Customer("John Doe", "john@example.com");
        customer1.setStatus("ACTIVE");
        customer1.setLoyaltyTier("GOLD");
        customer1.setTotalSpent(new BigDecimal("5000.00"));

        Customer customer2 = new Customer("Jane Smith", "jane@example.com");
        customer2.setStatus("ACTIVE");
        customer2.setLoyaltyTier("SILVER");
        customer2.setTotalSpent(new BigDecimal("2500.00"));

        customerRepo.save(customer1);
        customerRepo.save(customer2);

        // Query customers
        List<Customer> goldCustomers = customerRepo.findByLoyaltyTier("GOLD");
        System.out.println("   Gold customers: " + goldCustomers.size());

        List<Customer> highValue = customerRepo.findHighValueCustomers(new BigDecimal("1000.00"));
        System.out.println("   High-value customers: " + highValue.size());

        List<Customer> inactive = customerRepo.findInactiveCustomers(90);
        System.out.println("   Inactive (90+ days): " + inactive.size());

        // Segmentation
        List<Customer> segment = customerRepo.findBySegment("VIP");
        System.out.println("   VIP segment: " + segment.size());
    }

    private static void demonstrateCMS() {
        ArticleRepository articleRepo = new InMemoryArticleRepository();

        // Add articles
        Article article1 = new Article("Introduction to Design Patterns");
        article1.setAuthor("John Doe");
        article1.setStatus("PUBLISHED");
        article1.setCategory("TECHNOLOGY");
        article1.setPublishedDate(new Date());

        Article article2 = new Article("Advanced Repository Patterns");
        article2.setAuthor("Jane Smith");
        article2.setStatus("DRAFT");
        article2.setCategory("TECHNOLOGY");

        articleRepo.save(article1);
        articleRepo.save(article2);

        // Query articles
        List<Article> published = articleRepo.findPublished();
        System.out.println("   Published articles: " + published.size());

        List<Article> byAuthor = articleRepo.findByAuthor("John Doe");
        System.out.println("   By author: " + byAuthor.size());

        List<Article> byCategory = articleRepo.findByCategory("TECHNOLOGY");
        System.out.println("   Technology articles: " + byCategory.size());

        List<Article> recent = articleRepo.findRecentPublished(7);
        System.out.println("   Recent (7 days): " + recent.size());
    }

    private static void demonstrateMultiTenant() {
        MultiTenantUserRepository tenantRepo = new MultiTenantUserRepository();

        // Add users for different tenants
        User tenant1User = new User("user1", "user1@tenant1.com");
        tenant1User.setTenantId("TENANT-001");
        tenantRepo.save(tenant1User);

        User tenant2User = new User("user2", "user2@tenant2.com");
        tenant2User.setTenantId("TENANT-002");
        tenantRepo.save(tenant2User);

        // Query by tenant
        List<User> tenant1Users = tenantRepo.findByTenantId("TENANT-001");
        System.out.println("   Tenant 1 users: " + tenant1Users.size());

        List<User> tenant2Users = tenantRepo.findByTenantId("TENANT-002");
        System.out.println("   Tenant 2 users: " + tenant2Users.size());

        // Cross-tenant query (admin only)
        List<User> allUsers = tenantRepo.findAll();
        System.out.println("   All users (cross-tenant): " + allUsers.size());

        // Tenant isolation verification
        boolean isolated = tenantRepo.verifyTenantIsolation("TENANT-001", "TENANT-002");
        System.out.println("   Tenant isolation verified: " + isolated);
    }
}
