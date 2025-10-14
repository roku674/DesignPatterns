package Integration.ScatterGather;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * ScatterGather Pattern - Enterprise Integration Pattern
 *
 * <p>Category: Message Routing
 *
 * <p><b>Intent:</b> Broadcasts a message to multiple recipients and aggregates the responses
 * into a single cohesive result. This pattern enables parallel processing of requests across
 * multiple services while collecting and combining their responses.
 *
 * <p><b>Key Concepts:</b>
 * <ul>
 *   <li>Scatters request to multiple parallel recipients</li>
 *   <li>Collects all responses with timeout handling</li>
 *   <li>Aggregates responses into single unified result</li>
 *   <li>Handles partial failures and timeouts gracefully</li>
 *   <li>Supports concurrent processing for performance</li>
 * </ul>
 *
 * <p><b>When to Use:</b>
 * <ul>
 *   <li>You need to query multiple services and combine results</li>
 *   <li>You want to implement competitive bidding or price comparison</li>
 *   <li>You require high availability through service redundancy</li>
 *   <li>You need to aggregate data from distributed sources</li>
 *   <li>You want to maximize response speed through parallelization</li>
 * </ul>
 *
 * <p><b>Benefits:</b>
 * <ul>
 *   <li>Parallel processing improves response time</li>
 *   <li>Enables competitive selection from multiple providers</li>
 *   <li>Provides fault tolerance through redundancy</li>
 *   <li>Simplifies aggregation of distributed data</li>
 *   <li>Scalable to many concurrent recipients</li>
 * </ul>
 *
 * <p><b>Real-World Scenarios:</b>
 * <ol>
 *   <li>Price comparison: Get quotes from multiple vendors and select best price</li>
 *   <li>Search aggregation: Search multiple databases and combine results</li>
 *   <li>Availability check: Check inventory across multiple warehouses</li>
 *   <li>Best route: Query multiple routing services for optimal path</li>
 *   <li>Consensus voting: Collect votes from distributed nodes</li>
 *   <li>Credit check: Query multiple credit bureaus simultaneously</li>
 *   <li>Hotel booking: Check availability across hotel chains</li>
 *   <li>Weather forecast: Aggregate predictions from multiple services</li>
 *   <li>News aggregation: Collect stories from multiple sources</li>
 *   <li>Load balancing: Distribute requests and collect responses</li>
 * </ol>
 *
 * <p><b>Reference:</b> Enterprise Integration Patterns by Gregor Hohpe and Bobby Woolf
 * <br>https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html
 *
 * @author Enterprise Integration Patterns
 * @version 2.0
 * @since 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "ScatterGather";
    private static final String CATEGORY = "Message Routing";
    private static int scenarioCounter = 0;
    private static final ExecutorService executorService = Executors.newFixedThreadPool(10);

    /**
     * Main entry point demonstrating the Scatter-Gather pattern.
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        printHeader();
        printDescription();

        // Initialize the pattern infrastructure
        ScatterGatherImplementation implementation = initializeInfrastructure();

        try {
            // Execute comprehensive scenarios
            executeAllScenarios(implementation);

            // Print execution summary
            printSummary();
        } finally {
            executorService.shutdown();
            printFooter();
        }
    }

    /**
     * Initializes the Scatter-Gather infrastructure.
     *
     * @return Configured implementation instance
     */
    private static ScatterGatherImplementation initializeInfrastructure() {
        System.out.println("Initializing " + PATTERN_NAME + " infrastructure...");
        ScatterGatherImplementation implementation = new ScatterGatherImplementation();
        System.out.println("  ✓ Scatter broadcast channels configured");
        System.out.println("  ✓ Response aggregator initialized");
        System.out.println("  ✓ Timeout handlers installed");
        System.out.println("  ✓ Thread pool created (" + 10 + " threads)");
        System.out.println();
        return implementation;
    }

    /**
     * Executes all demonstration scenarios.
     *
     * @param implementation The pattern implementation
     */
    private static void executeAllScenarios(ScatterGatherImplementation implementation) {
        // Scenario 1: Price Comparison
        demonstratePriceComparison(implementation);

        // Scenario 2: Search Aggregation
        demonstrateSearchAggregation(implementation);

        // Scenario 3: Inventory Availability
        demonstrateInventoryCheck(implementation);

        // Scenario 4: Best Route Finding
        demonstrateBestRoute(implementation);

        // Scenario 5: Consensus Voting
        demonstrateConsensusVoting(implementation);

        // Scenario 6: Credit Bureau Check
        demonstrateCreditCheck(implementation);

        // Scenario 7: Hotel Availability
        demonstrateHotelBooking(implementation);

        // Scenario 8: Weather Forecast Aggregation
        demonstrateWeatherForecast(implementation);

        // Scenario 9: News Aggregation
        demonstrateNewsAggregation(implementation);

        // Scenario 10: Distributed Load Balancing
        demonstrateLoadBalancing(implementation);
    }

    /**
     * Scenario 1: Price comparison across multiple vendors.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstratePriceComparison(ScatterGatherImplementation implementation) {
        startScenario("Price Comparison", "Query multiple vendors for best product price");

        List<String> vendors = Arrays.asList("Amazon", "Walmart", "Target", "BestBuy", "NewEgg");
        String productId = "LAPTOP-X1";

        printInfo("Searching for product: " + productId);
        printInfo("Scattering request to " + vendors.size() + " vendors");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String vendor : vendors) {
            futures.add(executorService.submit(() -> queryVendor(vendor, productId)));
        }

        List<Map<String, Object>> results = collectResults(futures, 2000);
        Map<String, Object> bestOffer = findBestPrice(results);

        printSuccess("Received " + results.size() + " responses");
        printInfo("Best price: $" + bestOffer.get("price") + " from " + bestOffer.get("vendor"));

        endScenario();
    }

    /**
     * Scenario 2: Search aggregation across multiple data sources.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateSearchAggregation(ScatterGatherImplementation implementation) {
        startScenario("Search Aggregation", "Search multiple databases and combine results");

        List<String> databases = Arrays.asList("CustomerDB", "ProductDB", "OrderDB", "AnalyticsDB");
        String searchQuery = "enterprise integration";

        printInfo("Executing search query: " + searchQuery);
        printInfo("Scattering to " + databases.size() + " databases");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String db : databases) {
            futures.add(executorService.submit(() -> searchDatabase(db, searchQuery)));
        }

        List<Map<String, Object>> results = collectResults(futures, 3000);
        int totalResults = results.stream().mapToInt(r -> (int) r.get("count")).sum();

        printSuccess("Aggregated " + totalResults + " results from " + results.size() + " sources");

        endScenario();
    }

    /**
     * Scenario 3: Check inventory availability across warehouses.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateInventoryCheck(ScatterGatherImplementation implementation) {
        startScenario("Inventory Availability", "Check stock across multiple warehouses");

        List<String> warehouses = Arrays.asList("East Coast", "West Coast", "Midwest", "South", "International");
        String sku = "SKU-12345";

        printInfo("Checking availability for: " + sku);
        printInfo("Querying " + warehouses.size() + " warehouse locations");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String warehouse : warehouses) {
            futures.add(executorService.submit(() -> checkWarehouse(warehouse, sku)));
        }

        List<Map<String, Object>> results = collectResults(futures, 1500);
        int totalStock = results.stream().mapToInt(r -> (int) r.get("quantity")).sum();

        printSuccess("Total available stock: " + totalStock + " units");
        printInfo("Available in " + results.stream().filter(r -> (int)r.get("quantity") > 0).count() + " locations");

        endScenario();
    }

    /**
     * Scenario 4: Query multiple routing services for best route.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateBestRoute(ScatterGatherImplementation implementation) {
        startScenario("Best Route Finding", "Query routing services for optimal path");

        List<String> services = Arrays.asList("Google Maps", "MapQuest", "Waze", "Here Maps");
        String origin = "New York";
        String destination = "Los Angeles";

        printInfo("Finding route from " + origin + " to " + destination);
        printInfo("Querying " + services.size() + " routing services");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String service : services) {
            futures.add(executorService.submit(() -> getRoute(service, origin, destination)));
        }

        List<Map<String, Object>> results = collectResults(futures, 2500);
        Map<String, Object> fastest = results.stream()
            .min(Comparator.comparingInt(r -> (int) r.get("duration")))
            .orElse(new HashMap<>());

        printSuccess("Fastest route: " + fastest.get("duration") + " minutes via " + fastest.get("service"));

        endScenario();
    }

    /**
     * Scenario 5: Collect consensus votes from distributed nodes.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateConsensusVoting(ScatterGatherImplementation implementation) {
        startScenario("Consensus Voting", "Collect votes from distributed nodes");

        List<String> nodes = Arrays.asList("Node1", "Node2", "Node3", "Node4", "Node5", "Node6", "Node7");
        String proposal = "UPGRADE-v2.0";

        printInfo("Voting on proposal: " + proposal);
        printInfo("Collecting votes from " + nodes.size() + " nodes");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String node : nodes) {
            futures.add(executorService.submit(() -> collectVote(node, proposal)));
        }

        List<Map<String, Object>> results = collectResults(futures, 1000);
        long yesVotes = results.stream().filter(r -> "YES".equals(r.get("vote"))).count();
        long noVotes = results.stream().filter(r -> "NO".equals(r.get("vote"))).count();

        printSuccess("Voting complete: " + yesVotes + " YES, " + noVotes + " NO");
        printInfo("Consensus " + (yesVotes > noVotes ? "REACHED" : "NOT REACHED"));

        endScenario();
    }

    /**
     * Scenario 6: Query multiple credit bureaus simultaneously.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateCreditCheck(ScatterGatherImplementation implementation) {
        startScenario("Credit Bureau Check", "Query all major credit bureaus");

        List<String> bureaus = Arrays.asList("Equifax", "Experian", "TransUnion");
        String customerId = "CUST-789456";

        printInfo("Checking credit for customer: " + customerId);
        printInfo("Querying " + bureaus.size() + " credit bureaus");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String bureau : bureaus) {
            futures.add(executorService.submit(() -> queryCreditBureau(bureau, customerId)));
        }

        List<Map<String, Object>> results = collectResults(futures, 3000);
        double avgScore = results.stream()
            .mapToInt(r -> (int) r.get("score"))
            .average()
            .orElse(0.0);

        printSuccess("Received all credit reports");
        printInfo("Average credit score: " + String.format("%.0f", avgScore));

        endScenario();
    }

    /**
     * Scenario 7: Check hotel availability across chains.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateHotelBooking(ScatterGatherImplementation implementation) {
        startScenario("Hotel Availability", "Check rooms across hotel chains");

        List<String> chains = Arrays.asList("Marriott", "Hilton", "Hyatt", "IHG", "Accor");
        String location = "San Francisco";
        String dates = "Dec 15-20";

        printInfo("Searching hotels in " + location + " for " + dates);
        printInfo("Querying " + chains.size() + " hotel chains");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String chain : chains) {
            futures.add(executorService.submit(() -> checkHotelAvailability(chain, location, dates)));
        }

        List<Map<String, Object>> results = collectResults(futures, 2000);
        Map<String, Object> cheapest = results.stream()
            .filter(r -> (boolean) r.get("available"))
            .min(Comparator.comparingDouble(r -> (double) r.get("price")))
            .orElse(new HashMap<>());

        printSuccess("Found " + results.stream().filter(r -> (boolean) r.get("available")).count() + " available options");
        if (!cheapest.isEmpty()) {
            printInfo("Best rate: $" + cheapest.get("price") + "/night at " + cheapest.get("chain"));
        }

        endScenario();
    }

    /**
     * Scenario 8: Aggregate weather forecasts from multiple services.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateWeatherForecast(ScatterGatherImplementation implementation) {
        startScenario("Weather Forecast Aggregation", "Combine forecasts from multiple services");

        List<String> services = Arrays.asList("NOAA", "Weather.com", "AccuWeather", "DarkSky");
        String location = "Chicago, IL";

        printInfo("Getting forecast for: " + location);
        printInfo("Querying " + services.size() + " weather services");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String service : services) {
            futures.add(executorService.submit(() -> getWeatherForecast(service, location)));
        }

        List<Map<String, Object>> results = collectResults(futures, 1500);
        double avgTemp = results.stream()
            .mapToDouble(r -> (double) r.get("temperature"))
            .average()
            .orElse(0.0);

        printSuccess("Aggregated " + results.size() + " forecasts");
        printInfo("Average temperature: " + String.format("%.1f", avgTemp) + "°F");

        endScenario();
    }

    /**
     * Scenario 9: Aggregate news from multiple sources.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateNewsAggregation(ScatterGatherImplementation implementation) {
        startScenario("News Aggregation", "Collect news from multiple sources");

        List<String> sources = Arrays.asList("Reuters", "AP", "Bloomberg", "CNN", "BBC", "Al Jazeera");
        String topic = "Technology";

        printInfo("Aggregating news for topic: " + topic);
        printInfo("Querying " + sources.size() + " news sources");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String source : sources) {
            futures.add(executorService.submit(() -> fetchNews(source, topic)));
        }

        List<Map<String, Object>> results = collectResults(futures, 2500);
        int totalArticles = results.stream().mapToInt(r -> (int) r.get("articles")).sum();

        printSuccess("Aggregated " + totalArticles + " articles from " + results.size() + " sources");

        endScenario();
    }

    /**
     * Scenario 10: Distributed load balancing with response collection.
     *
     * @param implementation The pattern implementation
     */
    private static void demonstrateLoadBalancing(ScatterGatherImplementation implementation) {
        startScenario("Distributed Load Balancing", "Distribute requests and collect responses");

        List<String> servers = Arrays.asList("Server1", "Server2", "Server3", "Server4", "Server5");
        String requestId = "REQ-" + System.currentTimeMillis();

        printInfo("Processing request: " + requestId);
        printInfo("Distributing across " + servers.size() + " servers");

        List<Future<Map<String, Object>>> futures = new ArrayList<>();
        for (String server : servers) {
            futures.add(executorService.submit(() -> processOnServer(server, requestId)));
        }

        List<Map<String, Object>> results = collectResults(futures, 1000);
        long successCount = results.stream().filter(r -> "SUCCESS".equals(r.get("status"))).count();

        printSuccess(successCount + "/" + results.size() + " servers completed successfully");
        printInfo("Average response time: " +
            results.stream().mapToLong(r -> (long) r.get("responseTime")).average().orElse(0) + "ms");

        endScenario();
    }

    // Helper methods for simulating service calls

    private static Map<String, Object> queryVendor(String vendor, String productId) {
        simulateProcessing(200 + new Random().nextInt(300));
        Map<String, Object> result = new HashMap<>();
        result.put("vendor", vendor);
        result.put("productId", productId);
        result.put("price", 799.99 + new Random().nextDouble() * 200);
        result.put("inStock", new Random().nextBoolean());
        return result;
    }

    private static Map<String, Object> searchDatabase(String db, String query) {
        simulateProcessing(150 + new Random().nextInt(200));
        Map<String, Object> result = new HashMap<>();
        result.put("database", db);
        result.put("count", 10 + new Random().nextInt(50));
        return result;
    }

    private static Map<String, Object> checkWarehouse(String warehouse, String sku) {
        simulateProcessing(100 + new Random().nextInt(150));
        Map<String, Object> result = new HashMap<>();
        result.put("warehouse", warehouse);
        result.put("quantity", new Random().nextInt(100));
        return result;
    }

    private static Map<String, Object> getRoute(String service, String origin, String dest) {
        simulateProcessing(200 + new Random().nextInt(300));
        Map<String, Object> result = new HashMap<>();
        result.put("service", service);
        result.put("duration", 180 + new Random().nextInt(60));
        result.put("distance", 2800 + new Random().nextInt(200));
        return result;
    }

    private static Map<String, Object> collectVote(String node, String proposal) {
        simulateProcessing(50 + new Random().nextInt(100));
        Map<String, Object> result = new HashMap<>();
        result.put("node", node);
        result.put("vote", new Random().nextBoolean() ? "YES" : "NO");
        return result;
    }

    private static Map<String, Object> queryCreditBureau(String bureau, String customerId) {
        simulateProcessing(300 + new Random().nextInt(400));
        Map<String, Object> result = new HashMap<>();
        result.put("bureau", bureau);
        result.put("score", 650 + new Random().nextInt(150));
        return result;
    }

    private static Map<String, Object> checkHotelAvailability(String chain, String location, String dates) {
        simulateProcessing(150 + new Random().nextInt(250));
        Map<String, Object> result = new HashMap<>();
        result.put("chain", chain);
        result.put("available", new Random().nextBoolean());
        result.put("price", 150.0 + new Random().nextDouble() * 200);
        return result;
    }

    private static Map<String, Object> getWeatherForecast(String service, String location) {
        simulateProcessing(100 + new Random().nextInt(150));
        Map<String, Object> result = new HashMap<>();
        result.put("service", service);
        result.put("temperature", 60.0 + new Random().nextDouble() * 30);
        return result;
    }

    private static Map<String, Object> fetchNews(String source, String topic) {
        simulateProcessing(200 + new Random().nextInt(300));
        Map<String, Object> result = new HashMap<>();
        result.put("source", source);
        result.put("articles", 5 + new Random().nextInt(20));
        return result;
    }

    private static Map<String, Object> processOnServer(String server, String requestId) {
        simulateProcessing(80 + new Random().nextInt(120));
        Map<String, Object> result = new HashMap<>();
        result.put("server", server);
        result.put("status", new Random().nextDouble() > 0.1 ? "SUCCESS" : "FAILURE");
        result.put("responseTime", 80L + new Random().nextInt(120));
        return result;
    }

    private static List<Map<String, Object>> collectResults(List<Future<Map<String, Object>>> futures, long timeoutMs) {
        List<Map<String, Object>> results = new ArrayList<>();
        long deadline = System.currentTimeMillis() + timeoutMs;

        for (Future<Map<String, Object>> future : futures) {
            try {
                long remaining = deadline - System.currentTimeMillis();
                if (remaining > 0) {
                    results.add(future.get(remaining, TimeUnit.MILLISECONDS));
                }
            } catch (TimeoutException | InterruptedException | ExecutionException e) {
                // Handle timeout or failure
            }
        }
        return results;
    }

    private static Map<String, Object> findBestPrice(List<Map<String, Object>> results) {
        return results.stream()
            .filter(r -> (boolean) r.get("inStock"))
            .min(Comparator.comparingDouble(r -> (double) r.get("price")))
            .orElse(new HashMap<>());
    }

    private static void startScenario(String scenarioName, String description) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + scenarioName);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + description);
        System.out.println();
    }

    private static void endScenario() {
        System.out.println();
        System.out.println("  ✓ Scenario completed successfully");
        System.out.println();
    }

    private static void printHeader() {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" +
                " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: " + CATEGORY + " ".repeat(70 - 13 - CATEGORY.length()) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();
    }

    private static void printDescription() {
        System.out.println("Description:");
        System.out.println("  Broadcasts message to multiple recipients and aggregates responses");
        System.out.println("  for parallel processing and result combination.");
        System.out.println();
    }

    private static void printSummary() {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: " + CATEGORY);
        System.out.println("  Status: All scenarios completed successfully");
        System.out.println();
        System.out.println("  Key Benefits Demonstrated:");
        System.out.println("    • Parallel request distribution");
        System.out.println("    • Response aggregation and combination");
        System.out.println("    • Timeout and failure handling");
        System.out.println("    • Competitive selection capabilities");
        System.out.println("─".repeat(72));
    }

    private static void printFooter() {
        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void simulateProcessing(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    private static void printInfo(String message) {
        System.out.println("  ℹ " + message);
    }
}
