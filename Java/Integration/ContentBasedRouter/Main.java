package Integration.ContentBasedRouter;

import java.util.*;
import java.util.function.Function;

/**
 * ContentBasedRouter Pattern Demonstration
 *
 * Category: Message Routing
 *
 * Description:
 * Routes messages to different destinations based on the content of the message.
 * Unlike simple type-based routing, this pattern examines the actual payload
 * and makes routing decisions based on specific content criteria.
 *
 * Key Concepts:
 * - Inspects message payload for routing decisions
 * - Supports complex content analysis
 * - Enables fine-grained routing control
 * - Decouples routing logic from message producers
 *
 * Real-world scenarios demonstrated:
 * 1. JSON content routing
 * 2. XML content routing
 * 3. Amount-based routing
 * 4. Keyword-based routing
 * 5. Status-based routing
 * 6. Category-based routing
 * 7. Multi-field content routing
 * 8. Pattern matching routing
 * 9. Threshold-based routing
 * 10. Geographic content routing
 *
 * Reference: https://www.enterpriseintegrationpatterns.com/ContentBasedRouter.html
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContentBasedRouter Pattern Demo ===\n");

        System.out.println("Initializing ContentBasedRouter infrastructure...\n");

        // Scenario 1: JSON content routing
        System.out.println("--- Scenario 1: JSON content routing ---");
        demonstrateJsonContentRouting();
        System.out.println();

        // Scenario 2: XML content routing
        System.out.println("--- Scenario 2: XML content routing ---");
        demonstrateXmlContentRouting();
        System.out.println();

        // Scenario 3: Amount-based routing
        System.out.println("--- Scenario 3: Amount-based routing ---");
        demonstrateAmountBasedRouting();
        System.out.println();

        // Scenario 4: Keyword-based routing
        System.out.println("--- Scenario 4: Keyword-based routing ---");
        demonstrateKeywordBasedRouting();
        System.out.println();

        // Scenario 5: Status-based routing
        System.out.println("--- Scenario 5: Status-based routing ---");
        demonstrateStatusBasedRouting();
        System.out.println();

        // Scenario 6: Category-based routing
        System.out.println("--- Scenario 6: Category-based routing ---");
        demonstrateCategoryBasedRouting();
        System.out.println();

        // Scenario 7: Multi-field content routing
        System.out.println("--- Scenario 7: Multi-field content routing ---");
        demonstrateMultiFieldRouting();
        System.out.println();

        // Scenario 8: Pattern matching routing
        System.out.println("--- Scenario 8: Pattern matching routing ---");
        demonstratePatternMatchingRouting();
        System.out.println();

        // Scenario 9: Threshold-based routing
        System.out.println("--- Scenario 9: Threshold-based routing ---");
        demonstrateThresholdBasedRouting();
        System.out.println();

        // Scenario 10: Geographic content routing
        System.out.println("--- Scenario 10: Geographic content routing ---");
        demonstrateGeographicRouting();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates routing based on JSON message content.
     */
    private static void demonstrateJsonContentRouting() {
        System.out.println("Setting up JSON content routing scenario...");

        ContentBasedRouter router = new ContentBasedRouter();

        Channel premiumChannel = new Channel("PremiumCustomers");
        Channel standardChannel = new Channel("StandardCustomers");

        router.addRule(msg -> {
            String content = msg.getContent();
            return content.contains("\"tier\":\"PREMIUM\"");
        }, premiumChannel);
        router.addRule(msg -> true, standardChannel);

        Message msg1 = new Message("{\"tier\":\"PREMIUM\",\"customer\":\"John\"}");
        Message msg2 = new Message("{\"tier\":\"STANDARD\",\"customer\":\"Jane\"}");

        router.route(msg1);
        router.route(msg2);

        System.out.println("JSON content routing completed successfully!");
    }

    /**
     * Demonstrates routing based on XML message content.
     */
    private static void demonstrateXmlContentRouting() {
        System.out.println("Setting up XML content routing scenario...");

        ContentBasedRouter router = new ContentBasedRouter();

        Channel urgentChannel = new Channel("UrgentOrders");
        Channel normalChannel = new Channel("NormalOrders");

        router.addRule(msg -> {
            String content = msg.getContent();
            return content.contains("<priority>URGENT</priority>");
        }, urgentChannel);
        router.addRule(msg -> true, normalChannel);

        Message msg1 = new Message("<order><priority>URGENT</priority><id>123</id></order>");
        Message msg2 = new Message("<order><priority>NORMAL</priority><id>124</id></order>");

        router.route(msg1);
        router.route(msg2);

        System.out.println("XML content routing completed successfully!");
    }

    /**
     * Demonstrates routing based on monetary amounts in content.
     */
    private static void demonstrateAmountBasedRouting() {
        System.out.println("Setting up amount-based routing scenario...");

        AmountBasedRouter router = new AmountBasedRouter();

        Channel largeOrderChannel = new Channel("LargeOrders");
        Channel mediumOrderChannel = new Channel("MediumOrders");
        Channel smallOrderChannel = new Channel("SmallOrders");

        router.addAmountRule(amount -> amount >= 10000, largeOrderChannel);
        router.addAmountRule(amount -> amount >= 1000, mediumOrderChannel);
        router.addAmountRule(amount -> true, smallOrderChannel);

        Message msg1 = new Message("amount:15000");
        Message msg2 = new Message("amount:5000");
        Message msg3 = new Message("amount:500");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Amount-based routing completed successfully!");
    }

    /**
     * Demonstrates routing based on keywords in content.
     */
    private static void demonstrateKeywordBasedRouting() {
        System.out.println("Setting up keyword-based routing scenario...");

        KeywordBasedRouter router = new KeywordBasedRouter();

        Channel technicalChannel = new Channel("TechnicalSupport");
        Channel billingChannel = new Channel("BillingSupport");
        Channel generalChannel = new Channel("GeneralSupport");

        router.addKeyword("bug", technicalChannel);
        router.addKeyword("error", technicalChannel);
        router.addKeyword("invoice", billingChannel);
        router.addKeyword("payment", billingChannel);
        router.setDefaultChannel(generalChannel);

        Message msg1 = new Message("I found a bug in the application");
        Message msg2 = new Message("Where is my invoice?");
        Message msg3 = new Message("How do I use this feature?");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Keyword-based routing completed successfully!");
    }

    /**
     * Demonstrates routing based on status fields in content.
     */
    private static void demonstrateStatusBasedRouting() {
        System.out.println("Setting up status-based routing scenario...");

        ContentBasedRouter router = new ContentBasedRouter();

        Channel pendingChannel = new Channel("PendingProcessor");
        Channel approvedChannel = new Channel("ApprovedProcessor");
        Channel rejectedChannel = new Channel("RejectedProcessor");

        router.addRule(msg -> msg.getContent().contains("status:PENDING"), pendingChannel);
        router.addRule(msg -> msg.getContent().contains("status:APPROVED"), approvedChannel);
        router.addRule(msg -> msg.getContent().contains("status:REJECTED"), rejectedChannel);

        Message msg1 = new Message("order_id:100,status:PENDING");
        Message msg2 = new Message("order_id:101,status:APPROVED");
        Message msg3 = new Message("order_id:102,status:REJECTED");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Status-based routing completed successfully!");
    }

    /**
     * Demonstrates routing based on product categories.
     */
    private static void demonstrateCategoryBasedRouting() {
        System.out.println("Setting up category-based routing scenario...");

        ContentBasedRouter router = new ContentBasedRouter();

        Channel electronicsChannel = new Channel("ElectronicsWarehouse");
        Channel clothingChannel = new Channel("ClothingWarehouse");
        Channel foodChannel = new Channel("FoodWarehouse");

        router.addRule(msg -> msg.getContent().contains("category:ELECTRONICS"), electronicsChannel);
        router.addRule(msg -> msg.getContent().contains("category:CLOTHING"), clothingChannel);
        router.addRule(msg -> msg.getContent().contains("category:FOOD"), foodChannel);

        Message msg1 = new Message("product:Laptop,category:ELECTRONICS");
        Message msg2 = new Message("product:Shirt,category:CLOTHING");
        Message msg3 = new Message("product:Apple,category:FOOD");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Category-based routing completed successfully!");
    }

    /**
     * Demonstrates routing based on multiple content fields.
     */
    private static void demonstrateMultiFieldRouting() {
        System.out.println("Setting up multi-field routing scenario...");

        ContentBasedRouter router = new ContentBasedRouter();

        Channel vipChannel = new Channel("VIPProcessing");
        Channel expressChannel = new Channel("ExpressProcessing");
        Channel standardChannel = new Channel("StandardProcessing");

        router.addRule(msg -> {
            String content = msg.getContent();
            return content.contains("tier:VIP") && content.contains("urgent:true");
        }, vipChannel);
        router.addRule(msg -> msg.getContent().contains("urgent:true"), expressChannel);
        router.addRule(msg -> true, standardChannel);

        Message msg1 = new Message("customer:John,tier:VIP,urgent:true");
        Message msg2 = new Message("customer:Jane,tier:STANDARD,urgent:true");
        Message msg3 = new Message("customer:Bob,tier:STANDARD,urgent:false");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Multi-field routing completed successfully!");
    }

    /**
     * Demonstrates routing based on regex pattern matching.
     */
    private static void demonstratePatternMatchingRouting() {
        System.out.println("Setting up pattern matching routing scenario...");

        PatternBasedRouter router = new PatternBasedRouter();

        Channel emailChannel = new Channel("EmailProcessor");
        Channel phoneChannel = new Channel("PhoneProcessor");
        Channel urlChannel = new Channel("URLProcessor");

        router.addPattern(".*@.*\\..*", emailChannel);
        router.addPattern("\\d{3}-\\d{3}-\\d{4}", phoneChannel);
        router.addPattern("https?://.*", urlChannel);

        Message msg1 = new Message("contact:user@example.com");
        Message msg2 = new Message("contact:555-123-4567");
        Message msg3 = new Message("contact:https://example.com");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Pattern matching routing completed successfully!");
    }

    /**
     * Demonstrates routing based on numeric thresholds.
     */
    private static void demonstrateThresholdBasedRouting() {
        System.out.println("Setting up threshold-based routing scenario...");

        ThresholdRouter router = new ThresholdRouter();

        Channel criticalChannel = new Channel("CriticalAlerts");
        Channel warningChannel = new Channel("WarningAlerts");
        Channel infoChannel = new Channel("InfoAlerts");

        router.addThreshold(90, criticalChannel);
        router.addThreshold(70, warningChannel);
        router.addThreshold(0, infoChannel);

        Message msg1 = new Message("cpu_usage:95");
        Message msg2 = new Message("cpu_usage:75");
        Message msg3 = new Message("cpu_usage:45");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Threshold-based routing completed successfully!");
    }

    /**
     * Demonstrates routing based on geographic data in content.
     */
    private static void demonstrateGeographicRouting() {
        System.out.println("Setting up geographic routing scenario...");

        GeographicRouter router = new GeographicRouter();

        Channel northAmericaChannel = new Channel("NorthAmericaCenter");
        Channel europeChannel = new Channel("EuropeCenter");
        Channel asiaChannel = new Channel("AsiaCenter");

        router.addRegion("US", northAmericaChannel);
        router.addRegion("CA", northAmericaChannel);
        router.addRegion("UK", europeChannel);
        router.addRegion("DE", europeChannel);
        router.addRegion("JP", asiaChannel);
        router.addRegion("CN", asiaChannel);

        Message msg1 = new Message("order:123,country:US,zip:90210");
        Message msg2 = new Message("order:124,country:UK,zip:SW1A");
        Message msg3 = new Message("order:125,country:JP,zip:100-0001");

        router.route(msg1);
        router.route(msg2);
        router.route(msg3);

        System.out.println("Geographic routing completed successfully!");
    }
}

/**
 * Represents a message with content.
 */
class Message {
    private String content;
    private long timestamp;

    public Message(String content) {
        this.content = content;
        this.timestamp = System.currentTimeMillis();
    }

    public String getContent() {
        return content;
    }

    public long getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "Message[" + content + "]";
    }
}

/**
 * Represents a destination channel.
 */
class Channel {
    private String name;

    public Channel(String name) {
        this.name = name;
    }

    public void receive(Message message) {
        System.out.println("  [" + name + "] Received: " + message);
    }

    public String getName() {
        return name;
    }
}

/**
 * Basic content-based router using content inspection.
 */
class ContentBasedRouter {
    private List<RoutingRule> rules;

    public ContentBasedRouter() {
        this.rules = new ArrayList<>();
    }

    public void addRule(Function<Message, Boolean> condition, Channel channel) {
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
        System.out.println("  No matching route found");
    }

    private static class RoutingRule {
        private Function<Message, Boolean> condition;
        private Channel channel;

        public RoutingRule(Function<Message, Boolean> condition, Channel channel) {
            this.condition = condition;
            this.channel = channel;
        }

        public boolean matches(Message message) {
            return condition.apply(message);
        }

        public Channel getChannel() {
            return channel;
        }
    }
}

/**
 * Router specialized for amount-based routing.
 */
class AmountBasedRouter {
    private List<AmountRule> rules;

    public AmountBasedRouter() {
        this.rules = new ArrayList<>();
    }

    public void addAmountRule(Function<Double, Boolean> condition, Channel channel) {
        rules.add(new AmountRule(condition, channel));
    }

    public void route(Message message) {
        System.out.println("Routing by amount: " + message);
        double amount = extractAmount(message.getContent());
        for (AmountRule rule : rules) {
            if (rule.matches(amount)) {
                rule.getChannel().receive(message);
                return;
            }
        }
        System.out.println("  No matching route found");
    }

    private double extractAmount(String content) {
        String[] parts = content.split(":");
        if (parts.length > 1) {
            return Double.parseDouble(parts[1]);
        }
        return 0.0;
    }

    private static class AmountRule {
        private Function<Double, Boolean> condition;
        private Channel channel;

        public AmountRule(Function<Double, Boolean> condition, Channel channel) {
            this.condition = condition;
            this.channel = channel;
        }

        public boolean matches(double amount) {
            return condition.apply(amount);
        }

        public Channel getChannel() {
            return channel;
        }
    }
}

/**
 * Router specialized for keyword detection.
 */
class KeywordBasedRouter {
    private Map<String, Channel> keywordMap;
    private Channel defaultChannel;

    public KeywordBasedRouter() {
        this.keywordMap = new HashMap<>();
    }

    public void addKeyword(String keyword, Channel channel) {
        keywordMap.put(keyword.toLowerCase(), channel);
    }

    public void setDefaultChannel(Channel channel) {
        this.defaultChannel = channel;
    }

    public void route(Message message) {
        System.out.println("Routing by keyword: " + message);
        String content = message.getContent().toLowerCase();

        for (Map.Entry<String, Channel> entry : keywordMap.entrySet()) {
            if (content.contains(entry.getKey())) {
                entry.getValue().receive(message);
                return;
            }
        }

        if (defaultChannel != null) {
            defaultChannel.receive(message);
        } else {
            System.out.println("  No matching keyword found");
        }
    }
}

/**
 * Router specialized for pattern matching.
 */
class PatternBasedRouter {
    private List<PatternRule> rules;

    public PatternBasedRouter() {
        this.rules = new ArrayList<>();
    }

    public void addPattern(String pattern, Channel channel) {
        rules.add(new PatternRule(pattern, channel));
    }

    public void route(Message message) {
        System.out.println("Routing by pattern: " + message);
        String content = message.getContent();

        for (PatternRule rule : rules) {
            if (rule.matches(content)) {
                rule.getChannel().receive(message);
                return;
            }
        }
        System.out.println("  No matching pattern found");
    }

    private static class PatternRule {
        private String pattern;
        private Channel channel;

        public PatternRule(String pattern, Channel channel) {
            this.pattern = pattern;
            this.channel = channel;
        }

        public boolean matches(String content) {
            return content.matches(pattern);
        }

        public Channel getChannel() {
            return channel;
        }
    }
}

/**
 * Router specialized for threshold-based routing.
 */
class ThresholdRouter {
    private List<ThresholdRule> rules;

    public ThresholdRouter() {
        this.rules = new ArrayList<>();
    }

    public void addThreshold(double threshold, Channel channel) {
        rules.add(new ThresholdRule(threshold, channel));
    }

    public void route(Message message) {
        System.out.println("Routing by threshold: " + message);
        double value = extractValue(message.getContent());

        // Sort rules by threshold descending
        rules.sort((a, b) -> Double.compare(b.threshold, a.threshold));

        for (ThresholdRule rule : rules) {
            if (value >= rule.threshold) {
                rule.getChannel().receive(message);
                return;
            }
        }
        System.out.println("  No matching threshold found");
    }

    private double extractValue(String content) {
        String[] parts = content.split(":");
        if (parts.length > 1) {
            return Double.parseDouble(parts[1]);
        }
        return 0.0;
    }

    private static class ThresholdRule {
        private double threshold;
        private Channel channel;

        public ThresholdRule(double threshold, Channel channel) {
            this.threshold = threshold;
            this.channel = channel;
        }

        public Channel getChannel() {
            return channel;
        }
    }
}

/**
 * Router specialized for geographic routing.
 */
class GeographicRouter {
    private Map<String, Channel> regionMap;

    public GeographicRouter() {
        this.regionMap = new HashMap<>();
    }

    public void addRegion(String countryCode, Channel channel) {
        regionMap.put(countryCode, channel);
    }

    public void route(Message message) {
        System.out.println("Routing by geography: " + message);
        String content = message.getContent();
        String countryCode = extractCountryCode(content);

        Channel channel = regionMap.get(countryCode);
        if (channel != null) {
            channel.receive(message);
        } else {
            System.out.println("  No region mapping found for: " + countryCode);
        }
    }

    private String extractCountryCode(String content) {
        String[] parts = content.split(",");
        for (String part : parts) {
            if (part.contains("country:")) {
                return part.split(":")[1].trim();
            }
        }
        return "";
    }
}
