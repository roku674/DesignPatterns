package Microservices.APIComposition;

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

        // Scenario 1: Product Page Composition
        demonstrateProductPageComposition();

        // Scenario 2: User Dashboard Composition
        demonstrateUserDashboardComposition();

        // Scenario 3: Order Summary Composition
        demonstrateOrderSummaryComposition();

        // Scenario 4: Parallel Composition
        demonstrateParallelComposition();

        // Scenario 5: Error Handling in Composition
        demonstrateErrorHandling();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    private static void demonstrateProductPageComposition() {
        System.out.println("1. Product Page Composition");
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

    private static void demonstrateUserDashboardComposition() {
        System.out.println("2. User Dashboard Composition");
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

    private static void demonstrateOrderSummaryComposition() {
        System.out.println("3. Order Summary Composition");
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

    private static void demonstrateParallelComposition() {
        System.out.println("4. Parallel API Composition");
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

    private static void demonstrateErrorHandling() {
        System.out.println("5. Error Handling in Composition");
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
}
