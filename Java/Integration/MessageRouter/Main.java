package Integration.MessageRouter;

import java.util.*;
import java.util.function.Predicate;

/**
 * MessageRouter Pattern Demonstration
 *
 * Category: Message Routing
 *
 * Description:
 * Routes messages to different destinations based on conditions. The MessageRouter examines
 * message content or metadata and directs it to one or more appropriate channels.
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 * - Supports multiple routing strategies
 *
 * Real-world scenarios demonstrated:
 * 1. Type-based routing
 * 2. Priority-based routing
 * 3. Region-based routing
 * 4. Multi-criteria routing
 * 5. Load-balanced routing
 * 6. Failover routing
 * 7. Time-based routing
 * 8. Content-based routing
 * 9. Round-robin routing
 * 10. Weighted routing
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageRouter Pattern Demo ===\n");

        System.out.println("Initializing MessageRouter infrastructure...\n");

        // Scenario 1: Type-based routing
        System.out.println("--- Scenario 1: Type-based routing ---");
        demonstrateTypeBasedRouting();
        System.out.println();

        // Scenario 2: Priority-based routing
        System.out.println("--- Scenario 2: Priority-based routing ---");
        demonstratePriorityBasedRouting();
        System.out.println();

        // Scenario 3: Region-based routing
        System.out.println("--- Scenario 3: Region-based routing ---");
        demonstrateRegionBasedRouting();
        System.out.println();

        // Scenario 4: Multi-criteria routing
        System.out.println("--- Scenario 4: Multi-criteria routing ---");
        demonstrateMultiCriteriaRouting();
        System.out.println();

        // Scenario 5: Load-balanced routing
        System.out.println("--- Scenario 5: Load-balanced routing ---");
        demonstrateLoadBalancedRouting();
        System.out.println();

        // Scenario 6: Failover routing
        System.out.println("--- Scenario 6: Failover routing ---");
        demonstrateFailoverRouting();
        System.out.println();

        // Scenario 7: Time-based routing
        System.out.println("--- Scenario 7: Time-based routing ---");
        demonstrateTimeBasedRouting();
        System.out.println();

        // Scenario 8: Content-based routing
        System.out.println("--- Scenario 8: Content-based routing ---");
        demonstrateContentBasedRouting();
        System.out.println();

        // Scenario 9: Round-robin routing
        System.out.println("--- Scenario 9: Round-robin routing ---");
        demonstrateRoundRobinRouting();
        System.out.println();

        // Scenario 10: Weighted routing
        System.out.println("--- Scenario 10: Weighted routing ---");
        demonstrateWeightedRouting();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates type-based routing where messages are routed based on their type.
     */
    private static void demonstrateTypeBasedRouting() {
        System.out.println("Setting up type-based routing scenario...");

        MessageRouter router = new MessageRouter();

        // Create channels
        MessageChannel orderChannel = new MessageChannel("OrderChannel");
        MessageChannel paymentChannel = new MessageChannel("PaymentChannel");
        MessageChannel notificationChannel = new MessageChannel("NotificationChannel");

        // Add routing rules
        router.addRoute(msg -> msg.getType().equals("ORDER"), orderChannel);
        router.addRoute(msg -> msg.getType().equals("PAYMENT"), paymentChannel);
        router.addRoute(msg -> msg.getType().equals("NOTIFICATION"), notificationChannel);

        // Route messages
        Message orderMsg = new Message("ORDER", "New order #12345", "HIGH");
        Message paymentMsg = new Message("PAYMENT", "Payment received $100", "HIGH");
        Message notifMsg = new Message("NOTIFICATION", "User signed up", "LOW");

        router.route(orderMsg);
        router.route(paymentMsg);
        router.route(notifMsg);

        System.out.println("Type-based routing completed successfully!");
    }

    /**
     * Demonstrates priority-based routing where high-priority messages take precedence.
     */
    private static void demonstratePriorityBasedRouting() {
        System.out.println("Setting up priority-based routing scenario...");

        PriorityRouter router = new PriorityRouter();

        MessageChannel highPriorityChannel = new MessageChannel("HighPriorityChannel");
        MessageChannel normalPriorityChannel = new MessageChannel("NormalPriorityChannel");
        MessageChannel lowPriorityChannel = new MessageChannel("LowPriorityChannel");

        router.addRoute(msg -> msg.getPriority().equals("HIGH"), highPriorityChannel);
        router.addRoute(msg -> msg.getPriority().equals("NORMAL"), normalPriorityChannel);
        router.addRoute(msg -> msg.getPriority().equals("LOW"), lowPriorityChannel);

        Message msg1 = new Message("ORDER", "Critical order", "HIGH");
        Message msg2 = new Message("ORDER", "Regular order", "NORMAL");
        Message msg3 = new Message("ORDER", "Batch order", "LOW");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Priority-based routing completed successfully!");
    }

    /**
     * Demonstrates region-based routing for geographical distribution.
     */
    private static void demonstrateRegionBasedRouting() {
        System.out.println("Setting up region-based routing scenario...");

        MessageRouter router = new MessageRouter();

        MessageChannel usChannel = new MessageChannel("US-Region");
        MessageChannel euChannel = new MessageChannel("EU-Region");
        MessageChannel asiaChannel = new MessageChannel("Asia-Region");

        router.addRoute(msg -> msg.getMetadata("region").equals("US"), usChannel);
        router.addRoute(msg -> msg.getMetadata("region").equals("EU"), euChannel);
        router.addRoute(msg -> msg.getMetadata("region").equals("ASIA"), asiaChannel);

        Message usMsg = new Message("ORDER", "US Order", "NORMAL");
        usMsg.addMetadata("region", "US");

        Message euMsg = new Message("ORDER", "EU Order", "NORMAL");
        euMsg.addMetadata("region", "EU");

        Message asiaMsg = new Message("ORDER", "Asia Order", "NORMAL");
        asiaMsg.addMetadata("region", "ASIA");

        router.route(usMsg);
        router.route(euMsg);
        router.route(asiaMsg);

        System.out.println("Region-based routing completed successfully!");
    }

    /**
     * Demonstrates multi-criteria routing with complex conditions.
     */
    private static void demonstrateMultiCriteriaRouting() {
        System.out.println("Setting up multi-criteria routing scenario...");

        MessageRouter router = new MessageRouter();

        MessageChannel premiumChannel = new MessageChannel("PremiumChannel");
        MessageChannel standardChannel = new MessageChannel("StandardChannel");

        router.addRoute(msg ->
            msg.getPriority().equals("HIGH") &&
            "PREMIUM".equals(msg.getMetadata("customerTier")),
            premiumChannel);
        router.addRoute(msg -> true, standardChannel); // Default route

        Message premiumMsg = new Message("ORDER", "Premium order", "HIGH");
        premiumMsg.addMetadata("customerTier", "PREMIUM");

        Message standardMsg = new Message("ORDER", "Standard order", "NORMAL");

        router.route(premiumMsg);
        router.route(standardMsg);

        System.out.println("Multi-criteria routing completed successfully!");
    }

    /**
     * Demonstrates load-balanced routing across multiple channels.
     */
    private static void demonstrateLoadBalancedRouting() {
        System.out.println("Setting up load-balanced routing scenario...");

        LoadBalancedRouter router = new LoadBalancedRouter();

        MessageChannel server1 = new MessageChannel("Server-1");
        MessageChannel server2 = new MessageChannel("Server-2");
        MessageChannel server3 = new MessageChannel("Server-3");

        router.addChannel(server1);
        router.addChannel(server2);
        router.addChannel(server3);

        for (int i = 1; i <= 9; i++) {
            Message msg = new Message("REQUEST", "Request #" + i, "NORMAL");
            router.route(msg);
        }

        System.out.println("Load-balanced routing completed successfully!");
    }

    /**
     * Demonstrates failover routing with backup channels.
     */
    private static void demonstrateFailoverRouting() {
        System.out.println("Setting up failover routing scenario...");

        FailoverRouter router = new FailoverRouter();

        MessageChannel primaryChannel = new MessageChannel("Primary", false);
        MessageChannel secondaryChannel = new MessageChannel("Secondary");
        MessageChannel tertiaryChannel = new MessageChannel("Tertiary");

        router.addChannel(primaryChannel);
        router.addChannel(secondaryChannel);
        router.addChannel(tertiaryChannel);

        Message msg = new Message("ORDER", "Important order", "HIGH");
        router.route(msg);

        System.out.println("Failover routing completed successfully!");
    }

    /**
     * Demonstrates time-based routing for scheduled operations.
     */
    private static void demonstrateTimeBasedRouting() {
        System.out.println("Setting up time-based routing scenario...");

        MessageRouter router = new MessageRouter();

        MessageChannel businessHoursChannel = new MessageChannel("BusinessHours");
        MessageChannel afterHoursChannel = new MessageChannel("AfterHours");

        int currentHour = java.time.LocalTime.now().getHour();

        router.addRoute(msg -> {
            int hour = java.time.LocalTime.now().getHour();
            return hour >= 9 && hour < 17;
        }, businessHoursChannel);
        router.addRoute(msg -> true, afterHoursChannel);

        Message msg = new Message("SUPPORT", "Customer inquiry", "NORMAL");
        router.route(msg);

        System.out.println("Time-based routing completed successfully!");
    }

    /**
     * Demonstrates content-based routing examining message payload.
     */
    private static void demonstrateContentBasedRouting() {
        System.out.println("Setting up content-based routing scenario...");

        MessageRouter router = new MessageRouter();

        MessageChannel largeOrderChannel = new MessageChannel("LargeOrders");
        MessageChannel smallOrderChannel = new MessageChannel("SmallOrders");

        router.addRoute(msg -> {
            String content = msg.getContent();
            return content.contains("amount") &&
                   Integer.parseInt(content.split(":")[1]) > 1000;
        }, largeOrderChannel);
        router.addRoute(msg -> true, smallOrderChannel);

        Message largeOrder = new Message("ORDER", "amount:5000", "NORMAL");
        Message smallOrder = new Message("ORDER", "amount:50", "NORMAL");

        router.route(largeOrder);
        router.route(smallOrder);

        System.out.println("Content-based routing completed successfully!");
    }

    /**
     * Demonstrates round-robin routing for even distribution.
     */
    private static void demonstrateRoundRobinRouting() {
        System.out.println("Setting up round-robin routing scenario...");

        RoundRobinRouter router = new RoundRobinRouter();

        router.addChannel(new MessageChannel("Worker-1"));
        router.addChannel(new MessageChannel("Worker-2"));
        router.addChannel(new MessageChannel("Worker-3"));

        for (int i = 1; i <= 6; i++) {
            Message msg = new Message("TASK", "Task #" + i, "NORMAL");
            router.route(msg);
        }

        System.out.println("Round-robin routing completed successfully!");
    }

    /**
     * Demonstrates weighted routing for proportional distribution.
     */
    private static void demonstrateWeightedRouting() {
        System.out.println("Setting up weighted routing scenario...");

        WeightedRouter router = new WeightedRouter();

        router.addChannel(new MessageChannel("Server-A"), 5); // 50% traffic
        router.addChannel(new MessageChannel("Server-B"), 3); // 30% traffic
        router.addChannel(new MessageChannel("Server-C"), 2); // 20% traffic

        for (int i = 1; i <= 10; i++) {
            Message msg = new Message("REQUEST", "Request #" + i, "NORMAL");
            router.route(msg);
        }

        System.out.println("Weighted routing completed successfully!");
    }
}

/**
 * Represents a message in the system.
 */
class Message {
    private String type;
    private String content;
    private String priority;
    private Map<String, String> metadata;
    private long timestamp;

    public Message(String type, String content, String priority) {
        this.type = type;
        this.content = content;
        this.priority = priority;
        this.metadata = new HashMap<>();
        this.timestamp = System.currentTimeMillis();
    }

    public String getType() { return type; }
    public String getContent() { return content; }
    public String getPriority() { return priority; }
    public long getTimestamp() { return timestamp; }

    public void addMetadata(String key, String value) {
        metadata.put(key, value);
    }

    public String getMetadata(String key) {
        return metadata.get(key);
    }

    @Override
    public String toString() {
        return String.format("Message[type=%s, priority=%s, content=%s]", type, priority, content);
    }
}

/**
 * Represents a message channel (destination).
 */
class MessageChannel {
    private String name;
    private boolean available;

    public MessageChannel(String name) {
        this(name, true);
    }

    public MessageChannel(String name, boolean available) {
        this.name = name;
        this.available = available;
    }

    public void receive(Message message) {
        if (available) {
            System.out.println("  [" + name + "] Received: " + message);
        } else {
            throw new RuntimeException(name + " is not available");
        }
    }

    public String getName() { return name; }
    public boolean isAvailable() { return available; }
}

/**
 * Basic message router using predicate-based routing.
 */
class MessageRouter {
    private List<RoutingRule> rules;

    public MessageRouter() {
        this.rules = new ArrayList<>();
    }

    public void addRoute(Predicate<Message> condition, MessageChannel channel) {
        rules.add(new RoutingRule(condition, channel));
    }

    public void route(Message message) {
        System.out.println("Routing: " + message);
        for (RoutingRule rule : rules) {
            if (rule.matches(message)) {
                rule.getChannel().receive(message);
                return;
            }
        }
        System.out.println("  No matching route found for message");
    }

    private static class RoutingRule {
        private Predicate<Message> condition;
        private MessageChannel channel;

        public RoutingRule(Predicate<Message> condition, MessageChannel channel) {
            this.condition = condition;
            this.channel = channel;
        }

        public boolean matches(Message message) {
            return condition.test(message);
        }

        public MessageChannel getChannel() {
            return channel;
        }
    }
}

/**
 * Priority-based router that handles messages by priority.
 */
class PriorityRouter extends MessageRouter {
    public PriorityRouter() {
        super();
    }
}

/**
 * Load-balanced router distributing messages evenly.
 */
class LoadBalancedRouter {
    private List<MessageChannel> channels;
    private int currentIndex;

    public LoadBalancedRouter() {
        this.channels = new ArrayList<>();
        this.currentIndex = 0;
    }

    public void addChannel(MessageChannel channel) {
        channels.add(channel);
    }

    public void route(Message message) {
        if (channels.isEmpty()) {
            System.out.println("No channels available");
            return;
        }

        MessageChannel channel = channels.get(currentIndex);
        System.out.println("Load-balancing: " + message);
        channel.receive(message);

        currentIndex = (currentIndex + 1) % channels.size();
    }
}

/**
 * Failover router with backup channels.
 */
class FailoverRouter {
    private List<MessageChannel> channels;

    public FailoverRouter() {
        this.channels = new ArrayList<>();
    }

    public void addChannel(MessageChannel channel) {
        channels.add(channel);
    }

    public void route(Message message) {
        System.out.println("Attempting failover routing: " + message);
        for (MessageChannel channel : channels) {
            try {
                if (channel.isAvailable()) {
                    channel.receive(message);
                    return;
                }
            } catch (Exception e) {
                System.out.println("  Failed on " + channel.getName() + ", trying next...");
            }
        }
        System.out.println("  All channels failed!");
    }
}

/**
 * Round-robin router for sequential distribution.
 */
class RoundRobinRouter {
    private List<MessageChannel> channels;
    private int currentIndex;

    public RoundRobinRouter() {
        this.channels = new ArrayList<>();
        this.currentIndex = 0;
    }

    public void addChannel(MessageChannel channel) {
        channels.add(channel);
    }

    public void route(Message message) {
        if (channels.isEmpty()) return;

        MessageChannel channel = channels.get(currentIndex);
        System.out.println("Round-robin routing: " + message);
        channel.receive(message);

        currentIndex = (currentIndex + 1) % channels.size();
    }
}

/**
 * Weighted router for proportional distribution.
 */
class WeightedRouter {
    private List<WeightedChannel> channels;
    private int totalWeight;
    private int currentWeight;

    public WeightedRouter() {
        this.channels = new ArrayList<>();
        this.totalWeight = 0;
        this.currentWeight = 0;
    }

    public void addChannel(MessageChannel channel, int weight) {
        channels.add(new WeightedChannel(channel, weight));
        totalWeight += weight;
    }

    public void route(Message message) {
        if (channels.isEmpty()) return;

        currentWeight = (currentWeight + 1) % totalWeight;
        int weightSum = 0;

        for (WeightedChannel wc : channels) {
            weightSum += wc.weight;
            if (currentWeight < weightSum) {
                System.out.println("Weighted routing: " + message);
                wc.channel.receive(message);
                return;
            }
        }
    }

    private static class WeightedChannel {
        MessageChannel channel;
        int weight;

        WeightedChannel(MessageChannel channel, int weight) {
            this.channel = channel;
            this.weight = weight;
        }
    }
}
