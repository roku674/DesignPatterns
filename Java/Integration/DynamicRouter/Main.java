package Integration.DynamicRouter;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * DynamicRouter Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Routes messages based on runtime configuration that can change dynamically
 *
 * Key Concepts:
 * - Routing rules can be modified at runtime
 * - Supports hot-reloading of routing configuration
 * - Enables A/B testing and gradual rollouts
 * - Allows runtime routing optimization
 *
 * When to Use:
 * - You need to route messages based on runtime configuration that can change dynamically
 * - You want to decouple system components
 * - You require reliable message processing
 * - You need to scale message handling
 * - You want to maintain system flexibility
 *
 * Benefits:
 * - Loose coupling between components
 * - Scalable message processing
 * - Flexible system architecture
 * - Maintainable integration code
 * - Testable components
 *
 * Real-World Scenarios:
 * 1. Feature flags: Route to new service version based on flags
 * 2. Load balancing: Dynamic routing based on server load
 * 3. Maintenance mode: Route around services under maintenance
 * 4. A/B testing: Route percentage of traffic to test version
 * 5. Geographic routing: Route based on user location
 * 6. Time-based routing: Route based on time of day
 * 7. Circuit breaker: Route based on service health
 * 8. Canary deployment: Gradually route to new version
 * 9. Priority routing: Route based on customer tier
 * 10. Version routing: Route to specific API versions
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "DynamicRouter";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Routes messages based on runtime configuration that can change dynamically");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing DynamicRouter infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        DynamicRouterEngine router = new DynamicRouterEngine(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Router engine initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        // Scenario 1: Feature flags
        demonstrateFeatureFlags(router, infrastructure);

        // Scenario 2: Load balancing
        demonstrateLoadBalancing(router, infrastructure);

        // Scenario 3: Maintenance mode
        demonstrateMaintenanceMode(router, infrastructure);

        // Scenario 4: A/B testing
        demonstrateABTesting(router, infrastructure);

        // Scenario 5: Geographic routing
        demonstrateGeographicRouting(router, infrastructure);

        // Scenario 6: Time-based routing
        demonstrateTimeBasedRouting(router, infrastructure);

        // Scenario 7: Circuit breaker
        demonstrateCircuitBreaker(router, infrastructure);

        // Scenario 8: Canary deployment
        demonstrateCanaryDeployment(router, infrastructure);

        // Scenario 9: Priority routing
        demonstratePriorityRouting(router, infrastructure);

        // Scenario 10: Version routing
        demonstrateVersionRouting(router, infrastructure);

        // Summary
        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    /**
     * Demonstrates feature flag-based routing.
     * Routes to new service version when feature flag is enabled.
     */
    private static void demonstrateFeatureFlags(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Feature Flags", "Route to new service version based on flags");

        Map<String, Boolean> featureFlags = new HashMap<>();
        featureFlags.put("new_checkout", false);

        router.setRoutingRule(msg -> {
            boolean useNewVersion = featureFlags.getOrDefault("new_checkout", false);
            return useNewVersion ? "new_checkout_service" : "old_checkout_service";
        });

        Message message = new Message("checkout_request", "user_123", "Process checkout");
        printStep("Sending checkout request (flag=false)");
        String route1 = router.route(message);
        printInfo("Routed to: " + route1);

        featureFlags.put("new_checkout", true);
        printStep("Enabling feature flag");
        String route2 = router.route(message);
        printInfo("Routed to: " + route2);

        printSuccess("Feature flag routing completed");
        endScenario();
    }

    /**
     * Demonstrates load-based routing.
     * Routes messages based on current server load.
     */
    private static void demonstrateLoadBalancing(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Load Balancing", "Dynamic routing based on server load");

        Map<String, Integer> serverLoads = new HashMap<>();
        serverLoads.put("server_1", 50);
        serverLoads.put("server_2", 80);
        serverLoads.put("server_3", 30);

        router.setRoutingRule(msg -> {
            return serverLoads.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("server_1");
        });

        for (int i = 0; i < 5; i++) {
            Message message = new Message("request", "user_" + i, "Process request");
            String route = router.route(message);
            printInfo("Request " + (i + 1) + " routed to: " + route);
            serverLoads.put(route, serverLoads.get(route) + 10);
        }

        printSuccess("Load balancing completed");
        endScenario();
    }

    /**
     * Demonstrates maintenance mode routing.
     * Routes around services that are under maintenance.
     */
    private static void demonstrateMaintenanceMode(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Maintenance Mode", "Route around services under maintenance");

        Set<String> maintenanceServices = new HashSet<>();

        router.setRoutingRule(msg -> {
            String preferredService = msg.getHeaders().getOrDefault("preferred_service", "payment_service_1");
            if (maintenanceServices.contains(preferredService)) {
                return "payment_service_backup";
            }
            return preferredService;
        });

        Message message = new Message("payment", "order_123", "Process payment");
        message.addHeader("preferred_service", "payment_service_1");

        printStep("Sending payment request (normal mode)");
        String route1 = router.route(message);
        printInfo("Routed to: " + route1);

        maintenanceServices.add("payment_service_1");
        printStep("Putting payment_service_1 in maintenance mode");
        String route2 = router.route(message);
        printInfo("Routed to: " + route2);

        printSuccess("Maintenance mode routing completed");
        endScenario();
    }

    /**
     * Demonstrates A/B testing routing.
     * Routes percentage of traffic to test version.
     */
    private static void demonstrateABTesting(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("A/B Testing", "Route percentage of traffic to test version");

        double testPercentage = 0.2; // 20% to test version

        router.setRoutingRule(msg -> {
            int userId = Integer.parseInt(msg.getSender().split("_")[1]);
            return (userId % 10) < (testPercentage * 10) ? "version_b" : "version_a";
        });

        Map<String, Integer> routeCounts = new HashMap<>();
        for (int i = 0; i < 100; i++) {
            Message message = new Message("test", "user_" + i, "Test request");
            String route = router.route(message);
            routeCounts.put(route, routeCounts.getOrDefault(route, 0) + 1);
        }

        printInfo("Version A received: " + routeCounts.getOrDefault("version_a", 0) + " requests");
        printInfo("Version B received: " + routeCounts.getOrDefault("version_b", 0) + " requests");
        printSuccess("A/B testing routing completed");
        endScenario();
    }

    /**
     * Demonstrates geographic routing.
     * Routes based on user geographic location.
     */
    private static void demonstrateGeographicRouting(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Geographic Routing", "Route based on user location");

        Map<String, String> regionServers = new HashMap<>();
        regionServers.put("US", "us_east_1");
        regionServers.put("EU", "eu_west_1");
        regionServers.put("ASIA", "asia_pacific_1");

        router.setRoutingRule(msg -> {
            String region = msg.getHeaders().getOrDefault("region", "US");
            return regionServers.getOrDefault(region, "us_east_1");
        });

        String[] regions = {"US", "EU", "ASIA", "US", "EU"};
        for (String region : regions) {
            Message message = new Message("request", "user_" + region, "Process request");
            message.addHeader("region", region);
            String route = router.route(message);
            printInfo("Request from " + region + " routed to: " + route);
        }

        printSuccess("Geographic routing completed");
        endScenario();
    }

    /**
     * Demonstrates time-based routing.
     * Routes based on time of day for load distribution.
     */
    private static void demonstrateTimeBasedRouting(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Time-Based Routing", "Route based on time of day");

        router.setRoutingRule(msg -> {
            int hour = java.time.LocalTime.now().getHour();
            if (hour >= 9 && hour < 17) {
                return "business_hours_queue";
            } else {
                return "off_hours_queue";
            }
        });

        Message message = new Message("report", "system", "Generate report");
        String route = router.route(message);
        printInfo("Current hour: " + java.time.LocalTime.now().getHour());
        printInfo("Routed to: " + route);

        printSuccess("Time-based routing completed");
        endScenario();
    }

    /**
     * Demonstrates circuit breaker routing.
     * Routes based on service health metrics.
     */
    private static void demonstrateCircuitBreaker(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Circuit Breaker", "Route based on service health");

        Map<String, Integer> failureCounts = new HashMap<>();
        failureCounts.put("api_service", 0);
        int FAILURE_THRESHOLD = 3;

        router.setRoutingRule(msg -> {
            int failures = failureCounts.getOrDefault("api_service", 0);
            if (failures >= FAILURE_THRESHOLD) {
                return "fallback_service";
            }
            return "api_service";
        });

        for (int i = 0; i < 5; i++) {
            Message message = new Message("api_call", "client_" + i, "API request");
            String route = router.route(message);
            printInfo("Request " + (i + 1) + " routed to: " + route);

            if (i < 3) {
                failureCounts.put("api_service", failureCounts.get("api_service") + 1);
                printStep("Service failure recorded (" + failureCounts.get("api_service") + "/" + FAILURE_THRESHOLD + ")");
            }
        }

        printSuccess("Circuit breaker routing completed");
        endScenario();
    }

    /**
     * Demonstrates canary deployment routing.
     * Gradually routes more traffic to new version.
     */
    private static void demonstrateCanaryDeployment(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Canary Deployment", "Gradually route to new version");

        double[] canaryPercentages = {0.05, 0.10, 0.25, 0.50, 1.0};

        for (double percentage : canaryPercentages) {
            final double currentPercentage = percentage;
            router.setRoutingRule(msg -> {
                int userId = Integer.parseInt(msg.getSender().split("_")[1]);
                return (userId % 100) < (currentPercentage * 100) ? "canary_version" : "stable_version";
            });

            int canaryCount = 0;
            for (int i = 0; i < 100; i++) {
                Message message = new Message("request", "user_" + i, "Process request");
                String route = router.route(message);
                if (route.equals("canary_version")) {
                    canaryCount++;
                }
            }
            printInfo("Canary percentage: " + (int)(percentage * 100) + "%, Actual: " + canaryCount + "%");
        }

        printSuccess("Canary deployment completed");
        endScenario();
    }

    /**
     * Demonstrates priority-based routing.
     * Routes based on customer tier/priority.
     */
    private static void demonstratePriorityRouting(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Priority Routing", "Route based on customer tier");

        router.setRoutingRule(msg -> {
            String priority = msg.getHeaders().getOrDefault("priority", "standard");
            switch (priority) {
                case "premium":
                    return "premium_queue";
                case "enterprise":
                    return "enterprise_queue";
                default:
                    return "standard_queue";
            }
        });

        String[] priorities = {"standard", "premium", "enterprise", "premium", "standard"};
        for (int i = 0; i < priorities.length; i++) {
            Message message = new Message("request", "customer_" + i, "Process request");
            message.addHeader("priority", priorities[i]);
            String route = router.route(message);
            printInfo("Customer with " + priorities[i] + " tier routed to: " + route);
        }

        printSuccess("Priority routing completed");
        endScenario();
    }

    /**
     * Demonstrates version-based routing.
     * Routes to specific API versions based on client requirements.
     */
    private static void demonstrateVersionRouting(DynamicRouterEngine router, MessagingInfrastructure infrastructure) {
        startScenario("Version Routing", "Route to specific API versions");

        router.setRoutingRule(msg -> {
            String apiVersion = msg.getHeaders().getOrDefault("api_version", "v1");
            return "api_" + apiVersion;
        });

        String[] versions = {"v1", "v2", "v3", "v2", "v1"};
        for (int i = 0; i < versions.length; i++) {
            Message message = new Message("api_request", "client_" + i, "API call");
            message.addHeader("api_version", versions[i]);
            String route = router.route(message);
            printInfo("Client requesting " + versions[i] + " routed to: " + route);
        }

        printSuccess("Version routing completed");
        endScenario();
    }

    /**
     * Starts a scenario demonstration.
     */
    private static void startScenario(String name, String description) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + name);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + description);
        System.out.println();
    }

    /**
     * Ends a scenario demonstration.
     */
    private static void endScenario() {
        System.out.println();
    }

    /**
     * Prints execution summary.
     */
    private static void printSummary(MessagingInfrastructure infrastructure) {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: Message Routing");
        System.out.println("  Messages processed: " + infrastructure.getTotalMessages());
        System.out.println("  Status: All scenarios completed");
        System.out.println("─".repeat(72));
    }

    /**
     * Helper to print step information.
     */
    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    /**
     * Helper to print success message.
     */
    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    /**
     * Helper to print info message.
     */
    private static void printInfo(String message) {
        System.out.println("  ℹ " + message);
    }
}

/**
 * Represents a message in the messaging system.
 */
class Message {
    private final String messageId;
    private final String type;
    private final String sender;
    private final String content;
    private final Map<String, String> headers;
    private final long timestamp;

    /**
     * Creates a new message.
     *
     * @param type The message type
     * @param sender The message sender
     * @param content The message content
     */
    public Message(String type, String sender, String content) {
        this.messageId = UUID.randomUUID().toString();
        this.type = type;
        this.sender = sender;
        this.content = content;
        this.headers = new HashMap<>();
        this.timestamp = System.currentTimeMillis();
    }

    public String getMessageId() { return messageId; }
    public String getType() { return type; }
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public Map<String, String> getHeaders() { return headers; }
    public long getTimestamp() { return timestamp; }

    /**
     * Adds a header to the message.
     */
    public void addHeader(String key, String value) {
        headers.put(key, value);
    }
}

/**
 * Dynamic router engine that routes messages based on configurable rules.
 */
class DynamicRouterEngine {
    private final MessagingInfrastructure infrastructure;
    private Function<Message, String> routingRule;

    /**
     * Creates a new dynamic router.
     *
     * @param infrastructure The messaging infrastructure
     */
    public DynamicRouterEngine(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
        this.routingRule = msg -> "default_queue";
    }

    /**
     * Sets the routing rule.
     *
     * @param rule The routing rule function
     */
    public void setRoutingRule(Function<Message, String> rule) {
        this.routingRule = rule;
    }

    /**
     * Routes a message based on current routing rules.
     *
     * @param message The message to route
     * @return The destination
     */
    public String route(Message message) {
        String destination = routingRule.apply(message);
        infrastructure.sendMessage(destination, message);
        return destination;
    }
}

/**
 * Messaging infrastructure that manages message channels and delivery.
 */
class MessagingInfrastructure {
    private final Map<String, BlockingQueue<Message>> channels;
    private int totalMessages;

    /**
     * Creates new messaging infrastructure.
     */
    public MessagingInfrastructure() {
        this.channels = new ConcurrentHashMap<>();
        this.totalMessages = 0;
    }

    /**
     * Sends a message to a channel.
     *
     * @param channel The channel name
     * @param message The message to send
     */
    public void sendMessage(String channel, Message message) {
        channels.computeIfAbsent(channel, k -> new LinkedBlockingQueue<>()).offer(message);
        totalMessages++;
    }

    /**
     * Gets the total number of messages processed.
     *
     * @return The total message count
     */
    public int getTotalMessages() {
        return totalMessages;
    }
}
