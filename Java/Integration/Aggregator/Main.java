package Integration.Aggregator;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * Aggregator Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Combines multiple related messages into a single message
 *
 * Key Concepts:
 * - Collects related messages
 * - Combines them into single message
 * - Uses correlation identifier
 * - Handles completion detection
 *
 * When to Use:
 * - You need to combine multiple related messages into a single message
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
 * 1. Order aggregation: Combine order items into single order
 * 2. Price quotes: Aggregate quotes from multiple vendors
 * 3. Survey responses: Combine responses into results
 * 4. Batch completion: Wait for all batch items
 * 5. Parallel results: Combine parallel API call results
 * 6. Shopping cart: Aggregate items into cart
 * 7. Report compilation: Combine report sections
 * 8. Log aggregation: Combine distributed logs
 * 9. Scatter-gather: Aggregate scattered queries
 * 10. Multi-source data: Combine data from sources
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "Aggregator";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        System.out.println("Description:");
        System.out.println("  Combines multiple related messages into a single message");
        System.out.println();

        System.out.println("Initializing Aggregator infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        MessageAggregator aggregator = new MessageAggregator(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Aggregator engine initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        demonstrateOrderAggregation(aggregator, infrastructure);
        demonstratePriceQuotes(aggregator, infrastructure);
        demonstrateSurveyResponses(aggregator, infrastructure);
        demonstrateBatchCompletion(aggregator, infrastructure);
        demonstrateParallelResults(aggregator, infrastructure);
        demonstrateShoppingCart(aggregator, infrastructure);
        demonstrateReportCompilation(aggregator, infrastructure);
        demonstrateLogAggregation(aggregator, infrastructure);
        demonstrateScatterGather(aggregator, infrastructure);
        demonstrateMultiSourceData(aggregator, infrastructure);

        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void demonstrateOrderAggregation(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Order Aggregation", "Combine order items into single order");

        String correlationId = "order_12345";
        aggregator.addMessage(createMessage("order_item", "Item: Laptop - $1200", correlationId, 0, 3));
        aggregator.addMessage(createMessage("order_item", "Item: Mouse - $25", correlationId, 1, 3));
        aggregator.addMessage(createMessage("order_item", "Item: Keyboard - $75", correlationId, 2, 3));

        printStep("Received 3 order items");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Order aggregated successfully");
            printInfo("  Total items: 3");
            printInfo("  Total value: $1300");
        }

        printSuccess("Order aggregation completed");
        endScenario();
    }

    private static void demonstratePriceQuotes(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Price Quotes", "Aggregate quotes from multiple vendors");

        String correlationId = "quote_request_001";
        aggregator.addMessage(createMessage("price_quote", "Vendor A: $500", correlationId, 0, 4));
        aggregator.addMessage(createMessage("price_quote", "Vendor B: $475", correlationId, 1, 4));
        aggregator.addMessage(createMessage("price_quote", "Vendor C: $520", correlationId, 2, 4));
        aggregator.addMessage(createMessage("price_quote", "Vendor D: $490", correlationId, 3, 4));

        printStep("Received quotes from 4 vendors");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Quotes aggregated successfully");
            printInfo("  Best price: $475 (Vendor B)");
        }

        printSuccess("Price quote aggregation completed");
        endScenario();
    }

    private static void demonstrateSurveyResponses(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Survey Responses", "Combine responses into results");

        String correlationId = "survey_2024_Q1";
        aggregator.addMessage(createMessage("survey_response", "Response 1: Satisfied", correlationId, 0, 5));
        aggregator.addMessage(createMessage("survey_response", "Response 2: Very Satisfied", correlationId, 1, 5));
        aggregator.addMessage(createMessage("survey_response", "Response 3: Neutral", correlationId, 2, 5));
        aggregator.addMessage(createMessage("survey_response", "Response 4: Satisfied", correlationId, 3, 5));
        aggregator.addMessage(createMessage("survey_response", "Response 5: Very Satisfied", correlationId, 4, 5));

        printStep("Received 5 survey responses");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Survey responses aggregated");
            printInfo("  Average satisfaction: 4.2/5.0");
        }

        printSuccess("Survey response aggregation completed");
        endScenario();
    }

    private static void demonstrateBatchCompletion(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Batch Completion", "Wait for all batch items");

        String correlationId = "batch_process_789";
        aggregator.addMessage(createMessage("batch_result", "Job 1: Completed", correlationId, 0, 3));
        aggregator.addMessage(createMessage("batch_result", "Job 2: Completed", correlationId, 1, 3));
        aggregator.addMessage(createMessage("batch_result", "Job 3: Completed", correlationId, 2, 3));

        printStep("All batch jobs completed");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Batch processing completed");
            printInfo("  Total jobs: 3");
            printInfo("  Success rate: 100%");
        }

        printSuccess("Batch completion aggregation completed");
        endScenario();
    }

    private static void demonstrateParallelResults(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Parallel Results", "Combine parallel API call results");

        String correlationId = "parallel_api_call_456";
        aggregator.addMessage(createMessage("api_result", "Weather API: Sunny, 75°F", correlationId, 0, 3));
        aggregator.addMessage(createMessage("api_result", "News API: 10 articles", correlationId, 1, 3));
        aggregator.addMessage(createMessage("api_result", "Stocks API: AAPL $175.50", correlationId, 2, 3));

        printStep("Received results from 3 APIs");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ API results aggregated");
            printInfo("  All data retrieved successfully");
        }

        printSuccess("Parallel results aggregation completed");
        endScenario();
    }

    private static void demonstrateShoppingCart(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Shopping Cart", "Aggregate items into cart");

        String correlationId = "cart_user_987";
        aggregator.addMessage(createMessage("cart_item", "Product: Headphones $99", correlationId, 0, 4));
        aggregator.addMessage(createMessage("cart_item", "Product: Phone Case $15", correlationId, 1, 4));
        aggregator.addMessage(createMessage("cart_item", "Product: Charger $29", correlationId, 2, 4));
        aggregator.addMessage(createMessage("cart_item", "Product: Screen Protector $12", correlationId, 3, 4));

        printStep("Added 4 items to shopping cart");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Shopping cart aggregated");
            printInfo("  Total items: 4");
            printInfo("  Subtotal: $155");
        }

        printSuccess("Shopping cart aggregation completed");
        endScenario();
    }

    private static void demonstrateReportCompilation(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Report Compilation", "Combine report sections");

        String correlationId = "annual_report_2024";
        aggregator.addMessage(createMessage("report_section", "Section: Executive Summary", correlationId, 0, 5));
        aggregator.addMessage(createMessage("report_section", "Section: Financial Data", correlationId, 1, 5));
        aggregator.addMessage(createMessage("report_section", "Section: Market Analysis", correlationId, 2, 5));
        aggregator.addMessage(createMessage("report_section", "Section: Future Plans", correlationId, 3, 5));
        aggregator.addMessage(createMessage("report_section", "Section: Appendix", correlationId, 4, 5));

        printStep("Compiling 5 report sections");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Report compiled successfully");
            printInfo("  Total pages: 45");
        }

        printSuccess("Report compilation completed");
        endScenario();
    }

    private static void demonstrateLogAggregation(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Log Aggregation", "Combine distributed logs");

        String correlationId = "request_trace_abc123";
        aggregator.addMessage(createMessage("log_entry", "Server 1: Request received", correlationId, 0, 3));
        aggregator.addMessage(createMessage("log_entry", "Server 2: Processing data", correlationId, 1, 3));
        aggregator.addMessage(createMessage("log_entry", "Server 3: Response sent", correlationId, 2, 3));

        printStep("Aggregating logs from 3 servers");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Logs aggregated successfully");
            printInfo("  Full trace reconstructed");
        }

        printSuccess("Log aggregation completed");
        endScenario();
    }

    private static void demonstrateScatterGather(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Scatter-Gather", "Aggregate scattered queries");

        String correlationId = "search_query_xyz";
        aggregator.addMessage(createMessage("search_result", "Database 1: 5 results", correlationId, 0, 4));
        aggregator.addMessage(createMessage("search_result", "Database 2: 8 results", correlationId, 1, 4));
        aggregator.addMessage(createMessage("search_result", "Database 3: 3 results", correlationId, 2, 4));
        aggregator.addMessage(createMessage("search_result", "Database 4: 7 results", correlationId, 3, 4));

        printStep("Gathering results from 4 databases");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Search results aggregated");
            printInfo("  Total results: 23");
        }

        printSuccess("Scatter-gather aggregation completed");
        endScenario();
    }

    private static void demonstrateMultiSourceData(MessageAggregator aggregator, MessagingInfrastructure infrastructure) {
        startScenario("Multi-Source Data", "Combine data from sources");

        String correlationId = "data_sync_2024";
        aggregator.addMessage(createMessage("data_source", "CRM: 1000 contacts", correlationId, 0, 3));
        aggregator.addMessage(createMessage("data_source", "ERP: 500 orders", correlationId, 1, 3));
        aggregator.addMessage(createMessage("data_source", "Analytics: 50 reports", correlationId, 2, 3));

        printStep("Combining data from 3 sources");
        Message aggregated = aggregator.tryAggregate(correlationId);

        if (aggregated != null) {
            printInfo("✓ Data sources aggregated");
            printInfo("  Data synchronization complete");
        }

        printSuccess("Multi-source data aggregation completed");
        endScenario();
    }

    private static Message createMessage(String type, String content, String correlationId, int sequence, int total) {
        Message message = new Message(type, "system", content);
        message.addHeader("correlation_id", correlationId);
        message.addHeader("sequence", String.valueOf(sequence));
        message.addHeader("total", String.valueOf(total));
        return message;
    }

    private static void startScenario(String name, String description) {
        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + name);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + description);
        System.out.println();
    }

    private static void endScenario() {
        System.out.println();
    }

    private static void printSummary(MessagingInfrastructure infrastructure) {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: Message Routing");
        System.out.println("  Messages aggregated: " + infrastructure.getAggregatedCount());
        System.out.println("  Status: All scenarios completed");
        System.out.println("─".repeat(72));
    }

    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    private static void printInfo(String message) {
        System.out.println("  " + message);
    }
}

class Message {
    private final String messageId;
    private final String type;
    private final String sender;
    private final String content;
    private final Map<String, String> headers;
    private final long timestamp;

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

    public void addHeader(String key, String value) {
        headers.put(key, value);
    }
}

class AggregatedMessage extends Message {
    private final List<Message> sourceMessages;

    public AggregatedMessage(String type, String sender, String content, List<Message> sources) {
        super(type, sender, content);
        this.sourceMessages = new ArrayList<>(sources);
    }

    public List<Message> getSourceMessages() {
        return new ArrayList<>(sourceMessages);
    }
}

class MessageAggregator {
    private final MessagingInfrastructure infrastructure;
    private final Map<String, List<Message>> messageGroups;

    public MessageAggregator(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
        this.messageGroups = new ConcurrentHashMap<>();
    }

    public void addMessage(Message message) {
        String correlationId = message.getHeaders().get("correlation_id");
        messageGroups.computeIfAbsent(correlationId, k -> new ArrayList<>()).add(message);
    }

    public Message tryAggregate(String correlationId) {
        List<Message> messages = messageGroups.get(correlationId);
        if (messages == null || messages.isEmpty()) {
            return null;
        }

        int expectedTotal = Integer.parseInt(messages.get(0).getHeaders().get("total"));
        if (messages.size() == expectedTotal) {
            String aggregatedContent = messages.stream()
                    .map(Message::getContent)
                    .collect(Collectors.joining("; "));

            AggregatedMessage aggregated = new AggregatedMessage(
                    "aggregated_message",
                    "aggregator",
                    "Aggregated: " + aggregatedContent,
                    messages
            );
            aggregated.addHeader("correlation_id", correlationId);
            aggregated.addHeader("message_count", String.valueOf(messages.size()));

            messageGroups.remove(correlationId);
            infrastructure.incrementAggregatedCount();
            return aggregated;
        }

        return null;
    }
}

class MessagingInfrastructure {
    private int aggregatedCount;

    public MessagingInfrastructure() {
        this.aggregatedCount = 0;
    }

    public void incrementAggregatedCount() {
        aggregatedCount++;
    }

    public int getAggregatedCount() {
        return aggregatedCount;
    }
}
