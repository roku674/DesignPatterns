package Cloud.GatewayAggregation;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Gateway Aggregation Pattern Demonstration
 *
 * <p>The Gateway Aggregation pattern consolidates multiple individual requests to various
 * backend services into a single request. This pattern is useful when a client must make
 * multiple calls to different backend systems to perform an operation.</p>
 *
 * <p>Key Benefits:</p>
 * <ul>
 *   <li>Reduces chattiness between client and backend services</li>
 *   <li>Improves performance by executing requests in parallel</li>
 *   <li>Simplifies client code by providing a single endpoint</li>
 *   <li>Reduces latency by aggregating multiple service calls</li>
 * </ul>
 *
 * @author Design Patterns Demo
 * @version 1.0
 */
public class Main {

    /**
     * Service interface for backend microservices.
     */
    interface Service {
        /**
         * Retrieves data from the service.
         *
         * @param id The identifier for the data
         * @return Response data as a map
         */
        Map<String, Object> getData(String id);

        /**
         * Gets the name of the service.
         *
         * @return Service name
         */
        String getServiceName();
    }

    /**
     * User service that manages user information.
     */
    static class UserService implements Service {
        private Map<String, Map<String, Object>> userDatabase;

        public UserService() {
            userDatabase = new HashMap<>();
            userDatabase.put("user123", Map.of(
                "id", "user123",
                "name", "John Doe",
                "email", "john.doe@example.com",
                "memberSince", "2020-01-15"
            ));
            userDatabase.put("user456", Map.of(
                "id", "user456",
                "name", "Jane Smith",
                "email", "jane.smith@example.com",
                "memberSince", "2019-06-20"
            ));
        }

        @Override
        public Map<String, Object> getData(String id) {
            simulateDelay(100);
            Map<String, Object> user = userDatabase.get(id);
            if (user == null) {
                return Map.of("error", "User not found");
            }
            return user;
        }

        @Override
        public String getServiceName() {
            return "UserService";
        }
    }

    /**
     * Order service that manages order information.
     */
    static class OrderService implements Service {
        private Map<String, Map<String, Object>> orderDatabase;

        public OrderService() {
            orderDatabase = new HashMap<>();
            orderDatabase.put("user123", Map.of(
                "orders", Arrays.asList(
                    Map.of("orderId", "ORD001", "total", 299.99, "status", "delivered"),
                    Map.of("orderId", "ORD002", "total", 149.50, "status", "shipped")
                ),
                "totalOrders", 2
            ));
            orderDatabase.put("user456", Map.of(
                "orders", Arrays.asList(
                    Map.of("orderId", "ORD003", "total", 499.99, "status", "processing")
                ),
                "totalOrders", 1
            ));
        }

        @Override
        public Map<String, Object> getData(String id) {
            simulateDelay(150);
            Map<String, Object> orders = orderDatabase.get(id);
            if (orders == null) {
                return Map.of("orders", Collections.emptyList(), "totalOrders", 0);
            }
            return orders;
        }

        @Override
        public String getServiceName() {
            return "OrderService";
        }
    }

    /**
     * Payment service that manages payment information.
     */
    static class PaymentService implements Service {
        private Map<String, Map<String, Object>> paymentDatabase;

        public PaymentService() {
            paymentDatabase = new HashMap<>();
            paymentDatabase.put("user123", Map.of(
                "paymentMethods", Arrays.asList(
                    Map.of("type", "Credit Card", "lastFour", "4242"),
                    Map.of("type", "PayPal", "email", "john@example.com")
                ),
                "defaultMethod", "Credit Card"
            ));
            paymentDatabase.put("user456", Map.of(
                "paymentMethods", Arrays.asList(
                    Map.of("type", "Debit Card", "lastFour", "5555")
                ),
                "defaultMethod", "Debit Card"
            ));
        }

        @Override
        public Map<String, Object> getData(String id) {
            simulateDelay(120);
            Map<String, Object> payments = paymentDatabase.get(id);
            if (payments == null) {
                return Map.of("paymentMethods", Collections.emptyList());
            }
            return payments;
        }

        @Override
        public String getServiceName() {
            return "PaymentService";
        }
    }

    /**
     * Recommendation service that provides personalized recommendations.
     */
    static class RecommendationService implements Service {
        private Map<String, Map<String, Object>> recommendationDatabase;

        public RecommendationService() {
            recommendationDatabase = new HashMap<>();
            recommendationDatabase.put("user123", Map.of(
                "recommendations", Arrays.asList(
                    "Premium Headphones", "Wireless Mouse", "USB-C Cable"
                ),
                "category", "Electronics"
            ));
            recommendationDatabase.put("user456", Map.of(
                "recommendations", Arrays.asList(
                    "Running Shoes", "Fitness Tracker", "Yoga Mat"
                ),
                "category", "Sports"
            ));
        }

        @Override
        public Map<String, Object> getData(String id) {
            simulateDelay(200);
            Map<String, Object> recommendations = recommendationDatabase.get(id);
            if (recommendations == null) {
                return Map.of("recommendations", Collections.emptyList());
            }
            return recommendations;
        }

        @Override
        public String getServiceName() {
            return "RecommendationService";
        }
    }

    /**
     * Gateway that aggregates multiple service calls.
     */
    static class AggregationGateway {
        private UserService userService;
        private OrderService orderService;
        private PaymentService paymentService;
        private RecommendationService recommendationService;
        private ExecutorService executorService;

        public AggregationGateway() {
            this.userService = new UserService();
            this.orderService = new OrderService();
            this.paymentService = new PaymentService();
            this.recommendationService = new RecommendationService();
            this.executorService = Executors.newFixedThreadPool(4);
        }

        /**
         * Aggregates data from multiple services sequentially.
         *
         * @param userId User identifier
         * @return Aggregated response containing data from all services
         */
        public Map<String, Object> getAggregatedDataSequential(String userId) {
            long startTime = System.currentTimeMillis();

            Map<String, Object> result = new HashMap<>();
            result.put("user", userService.getData(userId));
            result.put("orders", orderService.getData(userId));
            result.put("payments", paymentService.getData(userId));
            result.put("recommendations", recommendationService.getData(userId));

            long duration = System.currentTimeMillis() - startTime;
            result.put("executionTimeMs", duration);
            result.put("executionType", "sequential");

            return result;
        }

        /**
         * Aggregates data from multiple services in parallel.
         *
         * @param userId User identifier
         * @return Aggregated response containing data from all services
         */
        public Map<String, Object> getAggregatedDataParallel(String userId) {
            long startTime = System.currentTimeMillis();

            Map<String, Object> result = new HashMap<>();

            try {
                CompletableFuture<Map<String, Object>> userFuture =
                    CompletableFuture.supplyAsync(() -> userService.getData(userId), executorService);
                CompletableFuture<Map<String, Object>> orderFuture =
                    CompletableFuture.supplyAsync(() -> orderService.getData(userId), executorService);
                CompletableFuture<Map<String, Object>> paymentFuture =
                    CompletableFuture.supplyAsync(() -> paymentService.getData(userId), executorService);
                CompletableFuture<Map<String, Object>> recommendationFuture =
                    CompletableFuture.supplyAsync(() -> recommendationService.getData(userId), executorService);

                CompletableFuture.allOf(userFuture, orderFuture, paymentFuture, recommendationFuture).join();

                result.put("user", userFuture.get());
                result.put("orders", orderFuture.get());
                result.put("payments", paymentFuture.get());
                result.put("recommendations", recommendationFuture.get());

            } catch (Exception e) {
                result.put("error", "Failed to aggregate data: " + e.getMessage());
            }

            long duration = System.currentTimeMillis() - startTime;
            result.put("executionTimeMs", duration);
            result.put("executionType", "parallel");

            return result;
        }

        /**
         * Aggregates data with fallback handling for failed services.
         *
         * @param userId User identifier
         * @return Aggregated response with fallback data for failed services
         */
        public Map<String, Object> getAggregatedDataWithFallback(String userId) {
            long startTime = System.currentTimeMillis();
            Map<String, Object> result = new HashMap<>();

            CompletableFuture<Map<String, Object>> userFuture =
                CompletableFuture.supplyAsync(() -> userService.getData(userId), executorService)
                    .exceptionally(ex -> Map.of("error", "UserService unavailable", "fallback", true));

            CompletableFuture<Map<String, Object>> orderFuture =
                CompletableFuture.supplyAsync(() -> orderService.getData(userId), executorService)
                    .exceptionally(ex -> Map.of("orders", Collections.emptyList(), "fallback", true));

            CompletableFuture<Map<String, Object>> paymentFuture =
                CompletableFuture.supplyAsync(() -> paymentService.getData(userId), executorService)
                    .exceptionally(ex -> Map.of("paymentMethods", Collections.emptyList(), "fallback", true));

            CompletableFuture<Map<String, Object>> recommendationFuture =
                CompletableFuture.supplyAsync(() -> recommendationService.getData(userId), executorService)
                    .exceptionally(ex -> Map.of("recommendations", Collections.emptyList(), "fallback", true));

            try {
                result.put("user", userFuture.get());
                result.put("orders", orderFuture.get());
                result.put("payments", paymentFuture.get());
                result.put("recommendations", recommendationFuture.get());
            } catch (Exception e) {
                result.put("error", "Unexpected error: " + e.getMessage());
            }

            long duration = System.currentTimeMillis() - startTime;
            result.put("executionTimeMs", duration);
            result.put("executionType", "parallel-with-fallback");

            return result;
        }

        /**
         * Shuts down the executor service.
         */
        public void shutdown() {
            executorService.shutdown();
        }
    }

    /**
     * Simulates network delay.
     *
     * @param milliseconds Delay duration in milliseconds
     */
    private static void simulateDelay(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Prints a formatted section header.
     *
     * @param title Section title
     */
    private static void printSection(String title) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println(title);
        System.out.println("=".repeat(60));
    }

    /**
     * Prints aggregated data in a readable format.
     *
     * @param data Aggregated data map
     */
    private static void printAggregatedData(Map<String, Object> data) {
        System.out.println("Execution Type: " + data.get("executionType"));
        System.out.println("Execution Time: " + data.get("executionTimeMs") + " ms");
        System.out.println("\nUser Data: " + data.get("user"));
        System.out.println("Order Data: " + data.get("orders"));
        System.out.println("Payment Data: " + data.get("payments"));
        System.out.println("Recommendations: " + data.get("recommendations"));
    }

    /**
     * Main method demonstrating the Gateway Aggregation pattern with 10 scenarios.
     *
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        System.out.println("=== Gateway Aggregation Pattern Demonstration ===\n");
        System.out.println("This pattern aggregates multiple backend service calls into a single request.");
        System.out.println("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        AggregationGateway gateway = new AggregationGateway();

        // Scenario 1: Sequential aggregation for user123
        printSection("Scenario 1: Sequential Aggregation (User123)");
        System.out.println("Making sequential calls to all services...");
        Map<String, Object> result1 = gateway.getAggregatedDataSequential("user123");
        printAggregatedData(result1);

        // Scenario 2: Parallel aggregation for user123
        printSection("Scenario 2: Parallel Aggregation (User123)");
        System.out.println("Making parallel calls to all services...");
        Map<String, Object> result2 = gateway.getAggregatedDataParallel("user123");
        printAggregatedData(result2);

        // Scenario 3: Performance comparison
        printSection("Scenario 3: Performance Comparison");
        long seqTime = (Long) result1.get("executionTimeMs");
        long parTime = (Long) result2.get("executionTimeMs");
        System.out.println("Sequential execution: " + seqTime + " ms");
        System.out.println("Parallel execution: " + parTime + " ms");
        System.out.println("Performance improvement: " +
            String.format("%.1f%%", (1 - (double) parTime / seqTime) * 100));

        // Scenario 4: Aggregation for different user (user456)
        printSection("Scenario 4: Aggregation for User456");
        Map<String, Object> result4 = gateway.getAggregatedDataParallel("user456");
        printAggregatedData(result4);

        // Scenario 5: Aggregation with fallback handling
        printSection("Scenario 5: Aggregation with Fallback");
        System.out.println("Demonstrating resilience with fallback handling...");
        Map<String, Object> result5 = gateway.getAggregatedDataWithFallback("user123");
        printAggregatedData(result5);

        // Scenario 6: Handling non-existent user
        printSection("Scenario 6: Non-Existent User");
        System.out.println("Requesting data for non-existent user...");
        Map<String, Object> result6 = gateway.getAggregatedDataParallel("user999");
        printAggregatedData(result6);

        // Scenario 7: Multiple rapid requests
        printSection("Scenario 7: Multiple Rapid Requests");
        System.out.println("Executing 3 parallel gateway requests...");
        long multiStart = System.currentTimeMillis();
        CompletableFuture<Map<String, Object>> req1 =
            CompletableFuture.supplyAsync(() -> gateway.getAggregatedDataParallel("user123"));
        CompletableFuture<Map<String, Object>> req2 =
            CompletableFuture.supplyAsync(() -> gateway.getAggregatedDataParallel("user456"));
        CompletableFuture<Map<String, Object>> req3 =
            CompletableFuture.supplyAsync(() -> gateway.getAggregatedDataParallel("user123"));

        CompletableFuture.allOf(req1, req2, req3).join();
        long multiDuration = System.currentTimeMillis() - multiStart;
        System.out.println("Total time for 3 parallel gateway requests: " + multiDuration + " ms");
        System.out.println("Average time per request: " + (multiDuration / 3) + " ms");

        // Scenario 8: Selective aggregation
        printSection("Scenario 8: Selective Service Aggregation");
        System.out.println("Aggregating only user and order data...");
        long selectiveStart = System.currentTimeMillis();
        Map<String, Object> selectiveResult = new HashMap<>();
        selectiveResult.put("user", new UserService().getData("user123"));
        selectiveResult.put("orders", new OrderService().getData("user123"));
        long selectiveDuration = System.currentTimeMillis() - selectiveStart;
        selectiveResult.put("executionTimeMs", selectiveDuration);
        System.out.println("Selective aggregation time: " + selectiveDuration + " ms");
        System.out.println("Result: " + selectiveResult);

        // Scenario 9: Gateway with caching simulation
        printSection("Scenario 9: Cached Aggregation Simulation");
        System.out.println("First request (cold cache):");
        long cacheStart1 = System.currentTimeMillis();
        Map<String, Object> cached1 = gateway.getAggregatedDataParallel("user123");
        long cacheDuration1 = System.currentTimeMillis() - cacheStart1;
        System.out.println("Time: " + cacheDuration1 + " ms");

        System.out.println("\nSimulating cached request:");
        System.out.println("Time: ~5 ms (from cache)");
        System.out.println("Cache hit - no backend calls made");

        // Scenario 10: Summary and best practices
        printSection("Scenario 10: Pattern Summary and Best Practices");
        System.out.println("Gateway Aggregation Pattern Benefits:");
        System.out.println("1. Reduced network overhead - single client request");
        System.out.println("2. Improved performance - parallel service execution");
        System.out.println("3. Simplified client code - single endpoint for multiple services");
        System.out.println("4. Better error handling - centralized fallback logic");
        System.out.println("5. Easier monitoring - single point for logging and metrics");
        System.out.println("\nBest Practices:");
        System.out.println("- Use parallel execution for independent service calls");
        System.out.println("- Implement circuit breakers for failing services");
        System.out.println("- Add caching to reduce backend load");
        System.out.println("- Set appropriate timeouts for each service");
        System.out.println("- Monitor and log aggregation performance");
        System.out.println("- Consider partial responses when some services fail");

        gateway.shutdown();
        System.out.println("\n=== Pattern Demonstration Complete ===");
    }
}
