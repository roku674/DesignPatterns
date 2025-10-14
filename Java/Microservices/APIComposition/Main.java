package Microservices.APIComposition;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * API Composition Pattern Demonstration
 *
 * The API Composition pattern aggregates data from multiple microservices
 * and composes a unified response for the client. This is useful when
 * a single client request needs data from multiple backend services.
 *
 * Key Components:
 * - API Composer: Orchestrates calls to multiple services
 * - Service Clients: Individual service communicators
 * - Response Aggregator: Combines responses into unified format
 *
 * Use Cases:
 * - Product details page (product info + reviews + inventory)
 * - User dashboard (profile + orders + recommendations)
 * - Order summary (order + customer + shipping + payment)
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== API Composition Pattern Demo ===\n");

        // Scenario 1: Basic API Composition
        demonstrateBasicComposition();

        // Scenario 2: Product Page Composition
        demonstrateProductPageComposition();

        // Scenario 3: User Dashboard Composition
        demonstrateUserDashboardComposition();

        // Scenario 4: Order Summary Composition
        demonstrateOrderSummaryComposition();

        // Scenario 5: Parallel Composition
        demonstrateParallelComposition();

        // Scenario 6: Sequential Composition
        demonstrateSequentialComposition();

        // Scenario 7: Error Handling in Composition
        demonstrateErrorHandling();

        // Scenario 8: Caching in Composition
        demonstrateCachedComposition();

        // Scenario 9: Partial Response Handling
        demonstratePartialResponse();

        // Scenario 10: Timeout Handling
        demonstrateTimeoutHandling();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic API Composition
     */
    private static void demonstrateBasicComposition() {
        System.out.println("1. Basic API Composition");
        System.out.println("-".repeat(50));

        ServiceA serviceA = new ServiceA();
        ServiceB serviceB = new ServiceB();

        BasicComposer composer = new BasicComposer(serviceA, serviceB);
        ComposedResponse response = composer.compose("request-1");

        System.out.println("Composed Response:");
        System.out.println("  Data from Service A: " + response.getDataA());
        System.out.println("  Data from Service B: " + response.getDataB());
        System.out.println();
    }

    /**
     * Scenario 2: Product Page Composition
     */
    private static void demonstrateProductPageComposition() {
        System.out.println("2. Product Page Composition");
        System.out.println("-".repeat(50));

        ProductService productService = new ProductService();
        ReviewService reviewService = new ReviewService();
        InventoryService inventoryService = new InventoryService();

        ProductPageComposer composer = new ProductPageComposer(
            productService, reviewService, inventoryService
        );

        ProductPageResponse response = composer.composeProductPage("PROD-123");
        System.out.println(response);
        System.out.println();
    }

    /**
     * Scenario 3: User Dashboard Composition
     */
    private static void demonstrateUserDashboardComposition() {
        System.out.println("3. User Dashboard Composition");
        System.out.println("-".repeat(50));

        UserService userService = new UserService();
        OrderService orderService = new OrderService();
        RecommendationService recommendationService = new RecommendationService();

        UserDashboardComposer composer = new UserDashboardComposer(
            userService, orderService, recommendationService
        );

        UserDashboardResponse response = composer.composeUserDashboard("USER-456");
        System.out.println(response);
        System.out.println();
    }

    /**
     * Scenario 4: Order Summary Composition
     */
    private static void demonstrateOrderSummaryComposition() {
        System.out.println("4. Order Summary Composition");
        System.out.println("-".repeat(50));

        OrderService orderService = new OrderService();
        CustomerService customerService = new CustomerService();
        ShippingService shippingService = new ShippingService();
        PaymentService paymentService = new PaymentService();

        OrderSummaryComposer composer = new OrderSummaryComposer(
            orderService, customerService, shippingService, paymentService
        );

        OrderSummaryResponse response = composer.composeOrderSummary("ORDER-789");
        System.out.println(response);
        System.out.println();
    }

    /**
     * Scenario 5: Parallel API Composition
     */
    private static void demonstrateParallelComposition() {
        System.out.println("5. Parallel API Composition");
        System.out.println("-".repeat(50));

        ProductService productService = new ProductService();
        ReviewService reviewService = new ReviewService();
        InventoryService inventoryService = new InventoryService();

        ParallelComposer composer = new ParallelComposer(
            productService, reviewService, inventoryService
        );

        long startTime = System.currentTimeMillis();
        ProductPageResponse response = composer.composeInParallel("PROD-999");
        long endTime = System.currentTimeMillis();

        System.out.println(response);
        System.out.println("Composition time: " + (endTime - startTime) + "ms");
        System.out.println();
    }

    /**
     * Scenario 6: Sequential Composition
     */
    private static void demonstrateSequentialComposition() {
        System.out.println("6. Sequential API Composition");
        System.out.println("-".repeat(50));

        System.out.println("Step 1: Fetch user profile");
        System.out.println("Step 2: Fetch user's order history (depends on user ID)");
        System.out.println("Step 3: Fetch recommendations (depends on order history)");

        SequentialComposer composer = new SequentialComposer();
        String result = composer.composeSequentially("USER-123");
        System.out.println("Final Result: " + result);
        System.out.println();
    }

    /**
     * Scenario 7: Error Handling in Composition
     */
    private static void demonstrateErrorHandling() {
        System.out.println("7. Error Handling in Composition");
        System.out.println("-".repeat(50));

        ProductService productService = new ProductService();
        ReviewService reviewService = new ReviewService();
        InventoryService inventoryService = new InventoryService();

        ResilientComposer composer = new ResilientComposer(
            productService, reviewService, inventoryService
        );

        ProductPageResponse response = composer.composeWithFallback("PROD-ERROR");
        System.out.println(response);
        System.out.println();
    }

    /**
     * Scenario 8: Caching in Composition
     */
    private static void demonstrateCachedComposition() {
        System.out.println("8. Caching in Composition");
        System.out.println("-".repeat(50));

        CachedComposer composer = new CachedComposer();

        System.out.println("First call (cache miss):");
        composer.compose("PROD-CACHED");

        System.out.println("\nSecond call (cache hit):");
        composer.compose("PROD-CACHED");
        System.out.println();
    }

    /**
     * Scenario 9: Partial Response Handling
     */
    private static void demonstratePartialResponse() {
        System.out.println("9. Partial Response Handling");
        System.out.println("-".repeat(50));

        PartialResponseComposer composer = new PartialResponseComposer();
        Map<String, Object> response = composer.composeWithPartialData("PROD-PARTIAL");

        System.out.println("Partial Response:");
        response.forEach((key, value) ->
            System.out.println("  " + key + ": " + value)
        );
        System.out.println();
    }

    /**
     * Scenario 10: Timeout Handling
     */
    private static void demonstrateTimeoutHandling() {
        System.out.println("10. Timeout Handling in Composition");
        System.out.println("-".repeat(50));

        TimeoutComposer composer = new TimeoutComposer();
        String result = composer.composeWithTimeout("REQ-TIMEOUT", 1000);
        System.out.println("Result: " + result);
        System.out.println();
    }
}

/**
 * Basic composer that combines data from two services
 */
class BasicComposer {
    private final ServiceA serviceA;
    private final ServiceB serviceB;

    public BasicComposer(ServiceA serviceA, ServiceB serviceB) {
        this.serviceA = serviceA;
        this.serviceB = serviceB;
    }

    public ComposedResponse compose(String requestId) {
        String dataA = serviceA.getData(requestId);
        String dataB = serviceB.getData(requestId);
        return new ComposedResponse(dataA, dataB);
    }
}

class ComposedResponse {
    private final String dataA;
    private final String dataB;

    public ComposedResponse(String dataA, String dataB) {
        this.dataA = dataA;
        this.dataB = dataB;
    }

    public String getDataA() { return dataA; }
    public String getDataB() { return dataB; }
}

class ServiceA {
    public String getData(String id) {
        return "Data from Service A for " + id;
    }
}

class ServiceB {
    public String getData(String id) {
        return "Data from Service B for " + id;
    }
}

/**
 * Product Page Composer - aggregates product, reviews, and inventory
 */
class ProductPageComposer {
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;

    public ProductPageComposer(ProductService productService,
                               ReviewService reviewService,
                               InventoryService inventoryService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.inventoryService = inventoryService;
    }

    public ProductPageResponse composeProductPage(String productId) {
        System.out.println("  Composing product page for " + productId);

        Product product = productService.getProduct(productId);
        List<Review> reviews = reviewService.getReviews(productId);
        int stock = inventoryService.getStock(productId);

        return new ProductPageResponse(product, reviews, stock);
    }
}

class ProductPageResponse {
    private final Product product;
    private final List<Review> reviews;
    private final int stock;

    public ProductPageResponse(Product product, List<Review> reviews, int stock) {
        this.product = product;
        this.reviews = reviews;
        this.stock = stock;
    }

    @Override
    public String toString() {
        return String.format("Product: %s%nReviews: %d%nStock: %d",
            product, reviews.size(), stock);
    }
}

/**
 * User Dashboard Composer - aggregates user profile, orders, and recommendations
 */
class UserDashboardComposer {
    private final UserService userService;
    private final OrderService orderService;
    private final RecommendationService recommendationService;

    public UserDashboardComposer(UserService userService,
                                 OrderService orderService,
                                 RecommendationService recommendationService) {
        this.userService = userService;
        this.orderService = orderService;
        this.recommendationService = recommendationService;
    }

    public UserDashboardResponse composeUserDashboard(String userId) {
        System.out.println("  Composing dashboard for user " + userId);

        User user = userService.getUser(userId);
        List<Order> orders = orderService.getOrdersByUser(userId);
        List<String> recommendations = recommendationService.getRecommendations(userId);

        return new UserDashboardResponse(user, orders, recommendations);
    }
}

class UserDashboardResponse {
    private final User user;
    private final List<Order> orders;
    private final List<String> recommendations;

    public UserDashboardResponse(User user, List<Order> orders, List<String> recommendations) {
        this.user = user;
        this.orders = orders;
        this.recommendations = recommendations;
    }

    @Override
    public String toString() {
        return String.format("User: %s%nOrders: %d%nRecommendations: %d",
            user.getName(), orders.size(), recommendations.size());
    }
}

/**
 * Order Summary Composer - aggregates order, customer, shipping, and payment info
 */
class OrderSummaryComposer {
    private final OrderService orderService;
    private final CustomerService customerService;
    private final ShippingService shippingService;
    private final PaymentService paymentService;

    public OrderSummaryComposer(OrderService orderService,
                                CustomerService customerService,
                                ShippingService shippingService,
                                PaymentService paymentService) {
        this.orderService = orderService;
        this.customerService = customerService;
        this.shippingService = shippingService;
        this.paymentService = paymentService;
    }

    public OrderSummaryResponse composeOrderSummary(String orderId) {
        System.out.println("  Composing order summary for " + orderId);

        Order order = orderService.getOrder(orderId);
        Customer customer = customerService.getCustomer(order.getCustomerId());
        ShippingInfo shipping = shippingService.getShippingInfo(orderId);
        PaymentInfo payment = paymentService.getPaymentInfo(orderId);

        return new OrderSummaryResponse(order, customer, shipping, payment);
    }
}

class OrderSummaryResponse {
    private final Order order;
    private final Customer customer;
    private final ShippingInfo shipping;
    private final PaymentInfo payment;

    public OrderSummaryResponse(Order order, Customer customer,
                                ShippingInfo shipping, PaymentInfo payment) {
        this.order = order;
        this.customer = customer;
        this.shipping = shipping;
        this.payment = payment;
    }

    @Override
    public String toString() {
        return String.format("Order: %s%nCustomer: %s%nShipping: %s%nPayment: %s",
            order.getId(), customer.getName(), shipping.getStatus(), payment.getMethod());
    }
}

/**
 * Parallel Composer - makes concurrent calls to multiple services
 */
class ParallelComposer {
    private final ExecutorService executor = Executors.newFixedThreadPool(3);
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;

    public ParallelComposer(ProductService productService,
                           ReviewService reviewService,
                           InventoryService inventoryService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.inventoryService = inventoryService;
    }

    public ProductPageResponse composeInParallel(String productId) {
        System.out.println("  Making parallel calls for " + productId);

        CompletableFuture<Product> productFuture = CompletableFuture.supplyAsync(
            () -> productService.getProduct(productId), executor
        );

        CompletableFuture<List<Review>> reviewsFuture = CompletableFuture.supplyAsync(
            () -> reviewService.getReviews(productId), executor
        );

        CompletableFuture<Integer> stockFuture = CompletableFuture.supplyAsync(
            () -> inventoryService.getStock(productId), executor
        );

        // Wait for all to complete
        CompletableFuture.allOf(productFuture, reviewsFuture, stockFuture).join();

        return new ProductPageResponse(
            productFuture.join(),
            reviewsFuture.join(),
            stockFuture.join()
        );
    }
}

/**
 * Sequential Composer - makes dependent sequential calls
 */
class SequentialComposer {
    public String composeSequentially(String userId) {
        String userProfile = fetchUserProfile(userId);
        String orderHistory = fetchOrderHistory(extractUserId(userProfile));
        String recommendations = fetchRecommendations(orderHistory);
        return recommendations;
    }

    private String fetchUserProfile(String userId) {
        System.out.println("  Fetching user profile: " + userId);
        return "Profile:" + userId;
    }

    private String fetchOrderHistory(String userId) {
        System.out.println("  Fetching order history for: " + userId);
        return "Orders:" + userId;
    }

    private String fetchRecommendations(String orderHistory) {
        System.out.println("  Fetching recommendations based on: " + orderHistory);
        return "Recommendations based on " + orderHistory;
    }

    private String extractUserId(String profile) {
        return profile.split(":")[1];
    }
}

/**
 * Resilient Composer - handles errors gracefully with fallbacks
 */
class ResilientComposer {
    private final ProductService productService;
    private final ReviewService reviewService;
    private final InventoryService inventoryService;

    public ResilientComposer(ProductService productService,
                            ReviewService reviewService,
                            InventoryService inventoryService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.inventoryService = inventoryService;
    }

    public ProductPageResponse composeWithFallback(String productId) {
        System.out.println("  Composing with fallback for " + productId);

        Product product = getProductWithFallback(productId);
        List<Review> reviews = getReviewsWithFallback(productId);
        int stock = getStockWithFallback(productId);

        return new ProductPageResponse(product, reviews, stock);
    }

    private Product getProductWithFallback(String productId) {
        try {
            return productService.getProduct(productId);
        } catch (Exception e) {
            System.out.println("  Product service failed, using fallback");
            return new Product(productId, "Unknown Product", 0.0);
        }
    }

    private List<Review> getReviewsWithFallback(String productId) {
        try {
            return reviewService.getReviews(productId);
        } catch (Exception e) {
            System.out.println("  Review service failed, returning empty list");
            return Collections.emptyList();
        }
    }

    private int getStockWithFallback(String productId) {
        try {
            return inventoryService.getStock(productId);
        } catch (Exception e) {
            System.out.println("  Inventory service failed, returning 0");
            return 0;
        }
    }
}

/**
 * Cached Composer - caches responses to improve performance
 */
class CachedComposer {
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String compose(String productId) {
        if (cache.containsKey(productId)) {
            System.out.println("  Returning cached response for " + productId);
            return cache.get(productId);
        }

        System.out.println("  Fetching fresh data for " + productId);
        String response = "Composed data for " + productId;
        cache.put(productId, response);
        return response;
    }
}

/**
 * Partial Response Composer - returns partial data if some services fail
 */
class PartialResponseComposer {
    public Map<String, Object> composeWithPartialData(String productId) {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("product", "Product " + productId);
            System.out.println("  Product data: SUCCESS");
        } catch (Exception e) {
            System.out.println("  Product data: FAILED");
        }

        try {
            response.put("reviews", Arrays.asList("Review 1", "Review 2"));
            System.out.println("  Reviews data: SUCCESS");
        } catch (Exception e) {
            System.out.println("  Reviews data: FAILED");
        }

        try {
            // Simulate failure
            throw new RuntimeException("Inventory service down");
        } catch (Exception e) {
            System.out.println("  Inventory data: FAILED");
            response.put("inventory", "unavailable");
        }

        return response;
    }
}

/**
 * Timeout Composer - handles timeouts gracefully
 */
class TimeoutComposer {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public String composeWithTimeout(String requestId, long timeoutMs) {
        Future<String> future = executor.submit(() -> {
            Thread.sleep(2000); // Simulate slow service
            return "Data for " + requestId;
        });

        try {
            return future.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            System.out.println("  Request timed out after " + timeoutMs + "ms");
            future.cancel(true);
            return "Timeout - partial data for " + requestId;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}

// Service classes
class ProductService {
    public Product getProduct(String productId) {
        System.out.println("  ProductService: Fetching " + productId);
        return new Product(productId, "Sample Product", 99.99);
    }
}

class ReviewService {
    public List<Review> getReviews(String productId) {
        System.out.println("  ReviewService: Fetching reviews for " + productId);
        return Arrays.asList(
            new Review("Great product!", 5),
            new Review("Good value", 4)
        );
    }
}

class InventoryService {
    public int getStock(String productId) {
        System.out.println("  InventoryService: Checking stock for " + productId);
        return 42;
    }
}

class UserService {
    public User getUser(String userId) {
        System.out.println("  UserService: Fetching user " + userId);
        return new User(userId, "John Doe");
    }
}

class OrderService {
    public Order getOrder(String orderId) {
        System.out.println("  OrderService: Fetching order " + orderId);
        return new Order(orderId, "CUST-123", 150.0);
    }

    public List<Order> getOrdersByUser(String userId) {
        System.out.println("  OrderService: Fetching orders for user " + userId);
        return Arrays.asList(
            new Order("ORD-1", userId, 100.0),
            new Order("ORD-2", userId, 200.0)
        );
    }
}

class RecommendationService {
    public List<String> getRecommendations(String userId) {
        System.out.println("  RecommendationService: Getting recommendations for " + userId);
        return Arrays.asList("Product A", "Product B", "Product C");
    }
}

class CustomerService {
    public Customer getCustomer(String customerId) {
        System.out.println("  CustomerService: Fetching customer " + customerId);
        return new Customer(customerId, "Jane Smith");
    }
}

class ShippingService {
    public ShippingInfo getShippingInfo(String orderId) {
        System.out.println("  ShippingService: Fetching shipping for " + orderId);
        return new ShippingInfo(orderId, "In Transit");
    }
}

class PaymentService {
    public PaymentInfo getPaymentInfo(String orderId) {
        System.out.println("  PaymentService: Fetching payment for " + orderId);
        return new PaymentInfo(orderId, "Credit Card");
    }
}

// Data classes
class Product {
    private final String id;
    private final String name;
    private final double price;

    public Product(String id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return name + " ($" + price + ")";
    }
}

class Review {
    private final String comment;
    private final int rating;

    public Review(String comment, int rating) {
        this.comment = comment;
        this.rating = rating;
    }
}

class User {
    private final String id;
    private final String name;

    public User(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() { return name; }
}

class Order {
    private final String id;
    private final String customerId;
    private final double total;

    public Order(String id, String customerId, double total) {
        this.id = id;
        this.customerId = customerId;
        this.total = total;
    }

    public String getId() { return id; }
    public String getCustomerId() { return customerId; }
}

class Customer {
    private final String id;
    private final String name;

    public Customer(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getName() { return name; }
}

class ShippingInfo {
    private final String orderId;
    private final String status;

    public ShippingInfo(String orderId, String status) {
        this.orderId = orderId;
        this.status = status;
    }

    public String getStatus() { return status; }
}

class PaymentInfo {
    private final String orderId;
    private final String method;

    public PaymentInfo(String orderId, String method) {
        this.orderId = orderId;
        this.method = method;
    }

    public String getMethod() { return method; }
}
