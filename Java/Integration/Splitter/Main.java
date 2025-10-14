package Integration.Splitter;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * Splitter Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Breaks a single message into multiple messages
 *
 * Key Concepts:
 * - Splits composite message into parts
 * - Each part processed independently
 * - Maintains correlation between parts
 * - Enables parallel processing
 *
 * When to Use:
 * - You need to break a single message into multiple messages
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
 * 1. Batch order processing: Split batch into individual orders
 * 2. File chunking: Split large file into chunks
 * 3. Collection processing: Process each item separately
 * 4. Report sections: Split report into sections
 * 5. Address list: Split mailing list for processing
 * 6. Invoice line items: Split invoice into line items
 * 7. Log batch splitting: Split log batches into entries
 * 8. CSV row splitting: Split CSV into individual rows
 * 9. Array decomposition: Split array into elements
 * 10. Document pages: Split document into pages
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "Splitter";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        System.out.println("Description:");
        System.out.println("  Breaks a single message into multiple messages");
        System.out.println();

        System.out.println("Initializing Splitter infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        MessageSplitter splitter = new MessageSplitter(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Splitter engine initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        demonstrateBatchOrderProcessing(splitter, infrastructure);
        demonstrateFileChunking(splitter, infrastructure);
        demonstrateCollectionProcessing(splitter, infrastructure);
        demonstrateReportSections(splitter, infrastructure);
        demonstrateAddressList(splitter, infrastructure);
        demonstrateInvoiceLineItems(splitter, infrastructure);
        demonstrateLogBatchSplitting(splitter, infrastructure);
        demonstrateCSVRowSplitting(splitter, infrastructure);
        demonstrateArrayDecomposition(splitter, infrastructure);
        demonstrateDocumentPages(splitter, infrastructure);

        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void demonstrateBatchOrderProcessing(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Batch Order Processing", "Split batch into individual orders");

        BatchMessage batch = new BatchMessage("order_batch", "order_system", "Batch of orders");
        batch.addItem("Order #1001: Product A x2");
        batch.addItem("Order #1002: Product B x1");
        batch.addItem("Order #1003: Product C x5");
        batch.addItem("Order #1004: Product D x3");

        printStep("Splitting batch of " + batch.getItems().size() + " orders");
        List<Message> splitMessages = splitter.split(batch);

        printInfo("✓ Split into " + splitMessages.size() + " individual orders");
        for (Message msg : splitMessages) {
            printInfo("  - " + msg.getContent());
        }

        printSuccess("Batch order processing completed");
        endScenario();
    }

    private static void demonstrateFileChunking(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("File Chunking", "Split large file into chunks");

        String largeFile = "A".repeat(1000);
        BatchMessage fileMessage = new BatchMessage("file_upload", "storage", "Large file");

        int chunkSize = 250;
        for (int i = 0; i < largeFile.length(); i += chunkSize) {
            int end = Math.min(i + chunkSize, largeFile.length());
            fileMessage.addItem("Chunk " + (i / chunkSize + 1) + ": " + largeFile.substring(i, end).substring(0, 20) + "...");
        }

        printStep("Splitting file into " + fileMessage.getItems().size() + " chunks");
        List<Message> chunks = splitter.split(fileMessage);

        printInfo("✓ File split into " + chunks.size() + " chunks");
        printSuccess("File chunking completed");
        endScenario();
    }

    private static void demonstrateCollectionProcessing(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Collection Processing", "Process each item separately");

        BatchMessage collection = new BatchMessage("user_list", "admin", "User collection");
        collection.addItem("User: john@example.com");
        collection.addItem("User: jane@example.com");
        collection.addItem("User: bob@example.com");
        collection.addItem("User: alice@example.com");
        collection.addItem("User: charlie@example.com");

        printStep("Splitting collection of " + collection.getItems().size() + " users");
        List<Message> userMessages = splitter.split(collection);

        printInfo("✓ Collection split into " + userMessages.size() + " individual user messages");
        printSuccess("Collection processing completed");
        endScenario();
    }

    private static void demonstrateReportSections(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Report Sections", "Split report into sections");

        BatchMessage report = new BatchMessage("quarterly_report", "reporting", "Q4 Report");
        report.addItem("Section 1: Executive Summary");
        report.addItem("Section 2: Financial Overview");
        report.addItem("Section 3: Sales Analysis");
        report.addItem("Section 4: Market Trends");
        report.addItem("Section 5: Future Outlook");

        printStep("Splitting report into " + report.getItems().size() + " sections");
        List<Message> sections = splitter.split(report);

        printInfo("✓ Report split into " + sections.size() + " sections");
        for (Message section : sections) {
            printInfo("  - " + section.getContent());
        }

        printSuccess("Report section splitting completed");
        endScenario();
    }

    private static void demonstrateAddressList(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Address List", "Split mailing list for processing");

        BatchMessage mailingList = new BatchMessage("mailing_campaign", "marketing", "Email campaign");
        mailingList.addItem("contact1@example.com");
        mailingList.addItem("contact2@example.com");
        mailingList.addItem("contact3@example.com");
        mailingList.addItem("contact4@example.com");

        printStep("Splitting mailing list of " + mailingList.getItems().size() + " contacts");
        List<Message> contacts = splitter.split(mailingList);

        printInfo("✓ Mailing list split into " + contacts.size() + " individual sends");
        printSuccess("Address list processing completed");
        endScenario();
    }

    private static void demonstrateInvoiceLineItems(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Invoice Line Items", "Split invoice into line items");

        BatchMessage invoice = new BatchMessage("invoice", "billing", "Invoice #INV-2024-001");
        invoice.addItem("Item: Widget A - $50.00");
        invoice.addItem("Item: Widget B - $75.00");
        invoice.addItem("Item: Service Fee - $25.00");
        invoice.addItem("Item: Shipping - $10.00");

        printStep("Splitting invoice into " + invoice.getItems().size() + " line items");
        List<Message> lineItems = splitter.split(invoice);

        printInfo("✓ Invoice split into " + lineItems.size() + " line items");
        for (Message item : lineItems) {
            printInfo("  - " + item.getContent());
        }

        printSuccess("Invoice line item splitting completed");
        endScenario();
    }

    private static void demonstrateLogBatchSplitting(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Log Batch Splitting", "Split log batches into entries");

        BatchMessage logBatch = new BatchMessage("log_batch", "logger", "Application logs");
        logBatch.addItem("2024-01-15 10:00:00 INFO: Application started");
        logBatch.addItem("2024-01-15 10:00:05 DEBUG: Loading configuration");
        logBatch.addItem("2024-01-15 10:00:10 INFO: Database connected");
        logBatch.addItem("2024-01-15 10:00:15 WARN: High memory usage");

        printStep("Splitting log batch of " + logBatch.getItems().size() + " entries");
        List<Message> logEntries = splitter.split(logBatch);

        printInfo("✓ Log batch split into " + logEntries.size() + " individual entries");
        printSuccess("Log batch splitting completed");
        endScenario();
    }

    private static void demonstrateCSVRowSplitting(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("CSV Row Splitting", "Split CSV into individual rows");

        BatchMessage csv = new BatchMessage("csv_import", "data_import", "Customer data CSV");
        csv.addItem("John,Doe,john@example.com");
        csv.addItem("Jane,Smith,jane@example.com");
        csv.addItem("Bob,Johnson,bob@example.com");
        csv.addItem("Alice,Williams,alice@example.com");

        printStep("Splitting CSV with " + csv.getItems().size() + " rows");
        List<Message> rows = splitter.split(csv);

        printInfo("✓ CSV split into " + rows.size() + " row messages");
        printSuccess("CSV row splitting completed");
        endScenario();
    }

    private static void demonstrateArrayDecomposition(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Array Decomposition", "Split array into elements");

        BatchMessage array = new BatchMessage("data_array", "processor", "Data array");
        array.addItem("Element[0]: Value A");
        array.addItem("Element[1]: Value B");
        array.addItem("Element[2]: Value C");
        array.addItem("Element[3]: Value D");
        array.addItem("Element[4]: Value E");

        printStep("Decomposing array of " + array.getItems().size() + " elements");
        List<Message> elements = splitter.split(array);

        printInfo("✓ Array decomposed into " + elements.size() + " element messages");
        printSuccess("Array decomposition completed");
        endScenario();
    }

    private static void demonstrateDocumentPages(MessageSplitter splitter, MessagingInfrastructure infrastructure) {
        startScenario("Document Pages", "Split document into pages");

        BatchMessage document = new BatchMessage("document", "document_processor", "Multi-page document");
        document.addItem("Page 1: Introduction and Overview");
        document.addItem("Page 2: Main Content Section A");
        document.addItem("Page 3: Main Content Section B");
        document.addItem("Page 4: Analysis and Findings");
        document.addItem("Page 5: Conclusion and Summary");

        printStep("Splitting document with " + document.getItems().size() + " pages");
        List<Message> pages = splitter.split(document);

        printInfo("✓ Document split into " + pages.size() + " page messages");
        for (Message page : pages) {
            printInfo("  - " + page.getContent());
        }

        printSuccess("Document page splitting completed");
        endScenario();
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
        System.out.println("  Messages split: " + infrastructure.getSplitCount());
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

class BatchMessage extends Message {
    private final List<String> items;

    public BatchMessage(String type, String sender, String content) {
        super(type, sender, content);
        this.items = new ArrayList<>();
    }

    public void addItem(String item) {
        items.add(item);
    }

    public List<String> getItems() {
        return new ArrayList<>(items);
    }
}

class MessageSplitter {
    private final MessagingInfrastructure infrastructure;

    public MessageSplitter(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
    }

    public List<Message> split(BatchMessage batchMessage) {
        String correlationId = UUID.randomUUID().toString();
        List<Message> splitMessages = new ArrayList<>();

        for (int i = 0; i < batchMessage.getItems().size(); i++) {
            Message splitMessage = new Message(
                    batchMessage.getType() + "_item",
                    batchMessage.getSender(),
                    batchMessage.getItems().get(i)
            );
            splitMessage.addHeader("correlation_id", correlationId);
            splitMessage.addHeader("sequence", String.valueOf(i));
            splitMessage.addHeader("total", String.valueOf(batchMessage.getItems().size()));

            splitMessages.add(splitMessage);
            infrastructure.incrementSplitCount();
        }

        return splitMessages;
    }
}

class MessagingInfrastructure {
    private int splitCount;

    public MessagingInfrastructure() {
        this.splitCount = 0;
    }

    public void incrementSplitCount() {
        splitCount++;
    }

    public int getSplitCount() {
        return splitCount;
    }
}
