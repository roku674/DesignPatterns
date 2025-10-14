package Microservices.TransactionLogTailing;

import java.util.*;
import java.util.concurrent.*;
import java.time.*;
import java.time.format.DateTimeFormatter;

/**
 * Transaction Log Tailing Pattern Implementation
 *
 * <p>The Transaction Log Tailing pattern reads the database transaction log to detect and
 * publish changes without modifying application code. This pattern is commonly used with
 * Change Data Capture (CDC) tools like Debezium to stream database changes to message brokers.</p>
 *
 * <h2>Pattern Benefits:</h2>
 * <ul>
 *   <li>No application code changes required</li>
 *   <li>Guaranteed to capture all database changes</li>
 *   <li>Low latency change detection</li>
 *   <li>Maintains strict ordering of changes</li>
 *   <li>Works with existing databases and applications</li>
 * </ul>
 *
 * <h2>Implementation Scenarios:</h2>
 * <ol>
 *   <li>Basic Transaction Log Reading</li>
 *   <li>Change Data Capture (CDC) Pipeline</li>
 *   <li>Multi-Table Change Streaming</li>
 *   <li>Event Transformation and Enrichment</li>
 *   <li>Offset Management and Recovery</li>
 *   <li>Schema Evolution Handling</li>
 *   <li>Filtered Log Tailing</li>
 *   <li>Real-time Data Replication</li>
 *   <li>Materialized View Synchronization</li>
 *   <li>Full Database Synchronization Pipeline</li>
 * </ol>
 *
 * @author Design Patterns Implementation
 * @version 2.0
 * @since 2024-01-01
 */
public class Main {

    /**
     * Main entry point demonstrating all Transaction Log Tailing pattern scenarios.
     *
     * @param args Command line arguments (not used)
     * @throws InterruptedException if thread operations are interrupted
     */
    public static void main(String[] args) throws InterruptedException {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║     TRANSACTION LOG TAILING PATTERN - MICROSERVICES           ║");
        System.out.println("║          Change Data Capture & Event Streaming                ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        // Scenario 1: Basic transaction log reading
        demonstrateBasicLogReading();

        // Scenario 2: CDC pipeline
        demonstrateCDCPipeline();

        // Scenario 3: Multi-table streaming
        demonstrateMultiTableStreaming();

        // Scenario 4: Event transformation
        demonstrateEventTransformation();

        // Scenario 5: Offset management
        demonstrateOffsetManagement();

        // Scenario 6: Schema evolution
        demonstrateSchemaEvolution();

        // Scenario 7: Filtered log tailing
        demonstrateFilteredTailing();

        // Scenario 8: Real-time replication
        demonstrateRealTimeReplication();

        // Scenario 9: Materialized view sync
        demonstrateMaterializedViewSync();

        // Scenario 10: Full synchronization pipeline
        demonstrateFullSyncPipeline();

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           ALL SCENARIOS COMPLETED SUCCESSFULLY                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
    }

    /**
     * Scenario 1: Demonstrates basic transaction log reading.
     * Shows how to read and parse database transaction log entries.
     */
    private static void demonstrateBasicLogReading() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 1: Basic Transaction Log Reading");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        LogReader reader = new LogReader(txLog);

        System.out.println("\n→ Simulating database operations");
        txLog.insert("users", Map.of("id", "1", "name", "Alice", "email", "alice@example.com"));
        txLog.update("users", "1", Map.of("email", "alice.new@example.com"));
        txLog.delete("users", "1");

        System.out.println("\n→ Reading transaction log");
        reader.readLog();

        System.out.println("\n✓ Scenario 1 completed: Basic log reading successful");
    }

    /**
     * Scenario 2: Demonstrates Change Data Capture (CDC) pipeline.
     * Shows how to stream database changes to a message broker.
     */
    private static void demonstrateCDCPipeline() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2: Change Data Capture (CDC) Pipeline");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        MessageBroker broker = new MessageBroker();
        CDCConnector connector = new CDCConnector(txLog, broker);

        System.out.println("\n→ Starting CDC connector");
        connector.start();

        System.out.println("\n→ Performing database operations");
        txLog.insert("orders", Map.of("orderId", "ORD-001", "customerId", "CUST-123", "amount", "299.99"));
        txLog.insert("orders", Map.of("orderId", "ORD-002", "customerId", "CUST-456", "amount", "499.99"));
        txLog.update("orders", "ORD-001", Map.of("status", "SHIPPED"));

        System.out.println("\n→ Processing changes through CDC pipeline");
        connector.processChanges();

        System.out.println("\n→ Verifying messages in broker");
        broker.printMessages();

        System.out.println("\n✓ Scenario 2 completed: CDC pipeline processed changes");
    }

    /**
     * Scenario 3: Demonstrates multi-table change streaming.
     * Shows how to monitor and stream changes from multiple tables.
     */
    private static void demonstrateMultiTableStreaming() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3: Multi-Table Change Streaming");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        MultiTableStreamer streamer = new MultiTableStreamer(txLog);

        System.out.println("\n→ Configuring tables to monitor");
        streamer.addTable("users");
        streamer.addTable("orders");
        streamer.addTable("products");

        System.out.println("\n→ Simulating changes across tables");
        txLog.insert("users", Map.of("id", "U001", "name", "Bob"));
        txLog.insert("products", Map.of("id", "P001", "name", "Laptop", "price", "999.99"));
        txLog.insert("orders", Map.of("id", "O001", "userId", "U001", "productId", "P001"));
        txLog.update("products", "P001", Map.of("price", "899.99"));

        System.out.println("\n→ Streaming changes from all tables");
        streamer.streamChanges();

        System.out.println("\n✓ Scenario 3 completed: Multi-table streaming successful");
    }

    /**
     * Scenario 4: Demonstrates event transformation and enrichment.
     * Shows how to transform raw log entries into domain events.
     */
    private static void demonstrateEventTransformation() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 4: Event Transformation and Enrichment");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        EventTransformer transformer = new EventTransformer(txLog);

        System.out.println("\n→ Inserting raw data");
        txLog.insert("orders", Map.of(
            "orderId", "ORD-100",
            "customerId", "CUST-999",
            "amount", "1299.99",
            "status", "PENDING"
        ));

        System.out.println("\n→ Transforming to domain events");
        transformer.transformAndPublish();

        System.out.println("\n→ Enriching events with additional context");
        transformer.enrichEvents();

        System.out.println("\n✓ Scenario 4 completed: Events transformed and enriched");
    }

    /**
     * Scenario 5: Demonstrates offset management and recovery.
     * Shows how to track processing position and recover from failures.
     */
    private static void demonstrateOffsetManagement() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 5: Offset Management and Recovery");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        OffsetManager offsetManager = new OffsetManager();
        LogTailer tailer = new LogTailer(txLog, offsetManager);

        System.out.println("\n→ Processing first batch of changes");
        for (int i = 1; i <= 5; i++) {
            txLog.insert("events", Map.of("id", String.valueOf(i), "data", "Event " + i));
        }
        tailer.processChanges();

        System.out.println("\n→ Simulating failure and restart");
        System.out.println("  [Crash simulation - processing interrupted]");

        System.out.println("\n→ Recovering from last saved offset");
        for (int i = 6; i <= 8; i++) {
            txLog.insert("events", Map.of("id", String.valueOf(i), "data", "Event " + i));
        }
        tailer.recoverAndProcess();

        System.out.println("\n✓ Scenario 5 completed: Offset management working correctly");
    }

    /**
     * Scenario 6: Demonstrates schema evolution handling.
     * Shows how to handle database schema changes during log tailing.
     */
    private static void demonstrateSchemaEvolution() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 6: Schema Evolution Handling");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        SchemaEvolutionHandler handler = new SchemaEvolutionHandler(txLog);

        System.out.println("\n→ Processing changes with schema version 1");
        txLog.insert("customers", Map.of("id", "1", "name", "John Doe", "email", "john@example.com"));

        System.out.println("\n→ Detecting schema change (added 'phone' column)");
        handler.detectSchemaChange("customers", "v2");

        System.out.println("\n→ Processing changes with schema version 2");
        txLog.insert("customers", Map.of(
            "id", "2",
            "name", "Jane Smith",
            "email", "jane@example.com",
            "phone", "+1-555-0123"
        ));

        System.out.println("\n→ Adapting to schema changes");
        handler.adaptToSchemaChanges();

        System.out.println("\n✓ Scenario 6 completed: Schema evolution handled successfully");
    }

    /**
     * Scenario 7: Demonstrates filtered log tailing.
     * Shows how to filter log entries based on specific criteria.
     */
    private static void demonstrateFilteredTailing() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 7: Filtered Log Tailing");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        FilteredLogTailer tailer = new FilteredLogTailer(txLog);

        System.out.println("\n→ Configuring filters");
        tailer.addTableFilter("orders");
        tailer.addOperationFilter("INSERT", "UPDATE");
        tailer.addFieldFilter("status", "COMPLETED");

        System.out.println("\n→ Generating mixed operations");
        txLog.insert("orders", Map.of("id", "1", "status", "PENDING"));
        txLog.insert("orders", Map.of("id", "2", "status", "COMPLETED"));
        txLog.update("orders", "1", Map.of("status", "COMPLETED"));
        txLog.insert("users", Map.of("id", "1", "name", "Test"));
        txLog.delete("orders", "1");

        System.out.println("\n→ Processing with filters applied");
        tailer.processFilteredChanges();

        System.out.println("\n✓ Scenario 7 completed: Filtered tailing executed");
    }

    /**
     * Scenario 8: Demonstrates real-time data replication.
     * Shows how to replicate data to secondary database in real-time.
     */
    private static void demonstrateRealTimeReplication() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 8: Real-time Data Replication");
        System.out.println("=".repeat(70));

        TransactionLog primaryLog = new TransactionLog();
        ReplicaDatabase replica = new ReplicaDatabase();
        ReplicationManager replicationManager = new ReplicationManager(primaryLog, replica);

        System.out.println("\n→ Starting replication");
        replicationManager.startReplication();

        System.out.println("\n→ Making changes to primary database");
        primaryLog.insert("products", Map.of("id", "P001", "name", "Laptop", "price", "1299.99"));
        primaryLog.insert("products", Map.of("id", "P002", "name", "Mouse", "price", "29.99"));
        primaryLog.update("products", "P001", Map.of("price", "1199.99"));

        System.out.println("\n→ Replicating to secondary database");
        replicationManager.replicate();

        System.out.println("\n→ Verifying replica state");
        replica.verify();

        System.out.println("\n✓ Scenario 8 completed: Real-time replication working");
    }

    /**
     * Scenario 9: Demonstrates materialized view synchronization.
     * Shows how to keep materialized views in sync with source tables.
     */
    private static void demonstrateMaterializedViewSync() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 9: Materialized View Synchronization");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        MaterializedViewManager viewManager = new MaterializedViewManager(txLog);

        System.out.println("\n→ Creating materialized view: order_summaries");
        viewManager.createView("order_summaries", "SELECT customer_id, COUNT(*), SUM(amount)");

        System.out.println("\n→ Making changes to source table");
        txLog.insert("orders", Map.of("id", "1", "customer_id", "C001", "amount", "100.00"));
        txLog.insert("orders", Map.of("id", "2", "customer_id", "C001", "amount", "200.00"));
        txLog.insert("orders", Map.of("id", "3", "customer_id", "C002", "amount", "150.00"));

        System.out.println("\n→ Synchronizing materialized view");
        viewManager.syncView("order_summaries");

        System.out.println("\n→ Displaying view contents");
        viewManager.displayView("order_summaries");

        System.out.println("\n✓ Scenario 9 completed: Materialized view synchronized");
    }

    /**
     * Scenario 10: Demonstrates full database synchronization pipeline.
     * Shows a complete end-to-end log tailing and event streaming pipeline.
     */
    private static void demonstrateFullSyncPipeline() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 10: Full Database Synchronization Pipeline");
        System.out.println("=".repeat(70));

        TransactionLog txLog = new TransactionLog();
        SynchronizationPipeline pipeline = new SynchronizationPipeline(txLog);

        System.out.println("\n→ Initializing synchronization pipeline");
        pipeline.initialize();

        System.out.println("\n→ Simulating complete e-commerce workflow");
        // User registration
        txLog.insert("users", Map.of("id", "U001", "name", "Alice", "email", "alice@shop.com"));

        // Product catalog updates
        txLog.insert("products", Map.of("id", "P001", "name", "Gaming Laptop", "price", "1499.99"));
        txLog.insert("products", Map.of("id", "P002", "name", "Wireless Mouse", "price", "49.99"));

        // Order placement
        txLog.insert("orders", Map.of(
            "id", "O001",
            "userId", "U001",
            "total", "1549.98",
            "status", "PENDING"
        ));

        // Order items
        txLog.insert("order_items", Map.of("orderId", "O001", "productId", "P001", "quantity", "1"));
        txLog.insert("order_items", Map.of("orderId", "O001", "productId", "P002", "quantity", "1"));

        // Payment processing
        txLog.insert("payments", Map.of("orderId", "O001", "amount", "1549.98", "status", "COMPLETED"));

        // Order status update
        txLog.update("orders", "O001", Map.of("status", "CONFIRMED"));

        System.out.println("\n→ Processing through full pipeline");
        pipeline.processAllChanges();

        System.out.println("\n→ Pipeline statistics");
        pipeline.printStatistics();

        System.out.println("\n✓ Scenario 10 completed: Full pipeline processed successfully");
    }
}

/**
 * Represents a database transaction log.
 */
class TransactionLog {
    private List<LogEntry> entries = new ArrayList<>();
    private long sequence = 0;

    /**
     * Records an INSERT operation in the transaction log.
     *
     * @param table The table name
     * @param data The inserted data
     */
    public void insert(String table, Map<String, String> data) {
        LogEntry entry = new LogEntry(++sequence, "INSERT", table, null, data, Instant.now());
        entries.add(entry);
        System.out.println("  [TX-LOG] INSERT into " + table + ": " + data);
    }

    /**
     * Records an UPDATE operation in the transaction log.
     *
     * @param table The table name
     * @param id The record identifier
     * @param data The updated data
     */
    public void update(String table, String id, Map<String, String> data) {
        LogEntry entry = new LogEntry(++sequence, "UPDATE", table, id, data, Instant.now());
        entries.add(entry);
        System.out.println("  [TX-LOG] UPDATE " + table + " id=" + id + ": " + data);
    }

    /**
     * Records a DELETE operation in the transaction log.
     *
     * @param table The table name
     * @param id The record identifier
     */
    public void delete(String table, String id) {
        LogEntry entry = new LogEntry(++sequence, "DELETE", table, id, null, Instant.now());
        entries.add(entry);
        System.out.println("  [TX-LOG] DELETE from " + table + " id=" + id);
    }

    /**
     * Gets all log entries.
     *
     * @return List of log entries
     */
    public List<LogEntry> getEntries() {
        return new ArrayList<>(entries);
    }

    /**
     * Gets log entries starting from a specific sequence number.
     *
     * @param fromSequence Starting sequence number
     * @return List of log entries
     */
    public List<LogEntry> getEntriesFrom(long fromSequence) {
        return entries.stream()
            .filter(e -> e.sequence > fromSequence)
            .toList();
    }

    /**
     * Gets the current sequence number.
     *
     * @return Current sequence number
     */
    public long getCurrentSequence() {
        return sequence;
    }
}

/**
 * Represents a single log entry in the transaction log.
 */
class LogEntry {
    long sequence;
    String operation;
    String table;
    String recordId;
    Map<String, String> data;
    Instant timestamp;

    LogEntry(long sequence, String operation, String table, String recordId, Map<String, String> data, Instant timestamp) {
        this.sequence = sequence;
        this.operation = operation;
        this.table = table;
        this.recordId = recordId;
        this.data = data;
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss.SSS").withZone(ZoneId.systemDefault());
        return String.format("[%d] %s %s %s at %s",
            sequence, operation, table, recordId != null ? "id=" + recordId : "", formatter.format(timestamp));
    }
}

/**
 * Reads and processes transaction log entries.
 */
class LogReader {
    private TransactionLog txLog;

    public LogReader(TransactionLog txLog) {
        this.txLog = txLog;
    }

    /**
     * Reads all entries from the transaction log.
     */
    public void readLog() {
        List<LogEntry> entries = txLog.getEntries();
        System.out.println("  Reading " + entries.size() + " log entries:");

        for (LogEntry entry : entries) {
            System.out.println("    " + entry);
            if (entry.data != null) {
                System.out.println("      Data: " + entry.data);
            }
        }
    }
}

/**
 * Simulates a message broker for event streaming.
 */
class MessageBroker {
    private List<String> messages = new ArrayList<>();

    /**
     * Publishes a message to the broker.
     *
     * @param topic The topic name
     * @param message The message content
     */
    public void publish(String topic, String message) {
        String fullMessage = "[" + topic + "] " + message;
        messages.add(fullMessage);
        System.out.println("  [BROKER] Published to " + topic + ": " + message);
    }

    /**
     * Prints all messages in the broker.
     */
    public void printMessages() {
        System.out.println("  Broker contains " + messages.size() + " messages:");
        for (String msg : messages) {
            System.out.println("    " + msg);
        }
    }
}

/**
 * Change Data Capture connector that streams log changes to message broker.
 */
class CDCConnector {
    private TransactionLog txLog;
    private MessageBroker broker;
    private long lastProcessedSequence = 0;

    public CDCConnector(TransactionLog txLog, MessageBroker broker) {
        this.txLog = txLog;
        this.broker = broker;
    }

    /**
     * Starts the CDC connector.
     */
    public void start() {
        System.out.println("  [CDC] Connector started");
        System.out.println("  [CDC] Connected to transaction log");
        System.out.println("  [CDC] Connected to message broker");
    }

    /**
     * Processes new changes from the transaction log.
     */
    public void processChanges() {
        List<LogEntry> newEntries = txLog.getEntriesFrom(lastProcessedSequence);

        for (LogEntry entry : newEntries) {
            String topic = "db-changes." + entry.table;
            String message = entry.operation + " " + (entry.data != null ? entry.data.toString() : "");
            broker.publish(topic, message);
            lastProcessedSequence = entry.sequence;
        }

        System.out.println("  [CDC] Processed " + newEntries.size() + " changes");
    }
}

/**
 * Streams changes from multiple tables.
 */
class MultiTableStreamer {
    private TransactionLog txLog;
    private Set<String> monitoredTables = new HashSet<>();

    public MultiTableStreamer(TransactionLog txLog) {
        this.txLog = txLog;
    }

    /**
     * Adds a table to monitor.
     *
     * @param tableName The table name
     */
    public void addTable(String tableName) {
        monitoredTables.add(tableName);
        System.out.println("  → Monitoring table: " + tableName);
    }

    /**
     * Streams changes from all monitored tables.
     */
    public void streamChanges() {
        List<LogEntry> entries = txLog.getEntries();
        Map<String, Integer> tableChanges = new HashMap<>();

        for (LogEntry entry : entries) {
            if (monitoredTables.contains(entry.table)) {
                tableChanges.merge(entry.table, 1, Integer::sum);
                System.out.println("  [STREAM] " + entry);
            }
        }

        System.out.println("\n  Changes by table:");
        for (Map.Entry<String, Integer> e : tableChanges.entrySet()) {
            System.out.println("    " + e.getKey() + ": " + e.getValue() + " changes");
        }
    }
}

/**
 * Transforms raw log entries into domain events.
 */
class EventTransformer {
    private TransactionLog txLog;

    public EventTransformer(TransactionLog txLog) {
        this.txLog = txLog;
    }

    /**
     * Transforms and publishes domain events.
     */
    public void transformAndPublish() {
        List<LogEntry> entries = txLog.getEntries();

        for (LogEntry entry : entries) {
            String eventType = entry.operation + "_" + entry.table.toUpperCase();
            System.out.println("  [TRANSFORM] " + eventType);
            System.out.println("    → Event ID: EVT-" + entry.sequence);
            System.out.println("    → Timestamp: " + entry.timestamp);
            System.out.println("    → Payload: " + entry.data);
        }
    }

    /**
     * Enriches events with additional context.
     */
    public void enrichEvents() {
        System.out.println("  [ENRICH] Adding metadata:");
        System.out.println("    → Service: order-service");
        System.out.println("    → Version: 2.1.0");
        System.out.println("    → Environment: production");
        System.out.println("    → Correlation ID: CORR-" + UUID.randomUUID().toString().substring(0, 8));
    }
}

/**
 * Manages offsets for resumable log tailing.
 */
class OffsetManager {
    private long savedOffset = 0;

    /**
     * Saves the current offset.
     *
     * @param offset The offset to save
     */
    public void saveOffset(long offset) {
        this.savedOffset = offset;
        System.out.println("  [OFFSET] Saved: " + offset);
    }

    /**
     * Gets the last saved offset.
     *
     * @return The saved offset
     */
    public long getOffset() {
        return savedOffset;
    }
}

/**
 * Tails the transaction log with offset management.
 */
class LogTailer {
    private TransactionLog txLog;
    private OffsetManager offsetManager;

    public LogTailer(TransactionLog txLog, OffsetManager offsetManager) {
        this.txLog = txLog;
        this.offsetManager = offsetManager;
    }

    /**
     * Processes changes from the current offset.
     */
    public void processChanges() {
        long startOffset = offsetManager.getOffset();
        List<LogEntry> entries = txLog.getEntriesFrom(startOffset);

        System.out.println("  Processing from offset " + startOffset);
        for (LogEntry entry : entries) {
            System.out.println("    → Processing: " + entry);
            offsetManager.saveOffset(entry.sequence);
        }
    }

    /**
     * Recovers from failure and continues processing.
     */
    public void recoverAndProcess() {
        long recoveredOffset = offsetManager.getOffset();
        System.out.println("  Recovered from offset: " + recoveredOffset);
        processChanges();
    }
}

/**
 * Handles database schema evolution.
 */
class SchemaEvolutionHandler {
    private TransactionLog txLog;
    private Map<String, String> tableSchemas = new HashMap<>();

    public SchemaEvolutionHandler(TransactionLog txLog) {
        this.txLog = txLog;
        tableSchemas.put("customers", "v1");
    }

    /**
     * Detects a schema change.
     *
     * @param tableName The table name
     * @param newVersion The new schema version
     */
    public void detectSchemaChange(String tableName, String newVersion) {
        String oldVersion = tableSchemas.get(tableName);
        System.out.println("  [SCHEMA] Change detected: " + tableName);
        System.out.println("    Old version: " + oldVersion);
        System.out.println("    New version: " + newVersion);
        tableSchemas.put(tableName, newVersion);
    }

    /**
     * Adapts processing to schema changes.
     */
    public void adaptToSchemaChanges() {
        System.out.println("  [SCHEMA] Adapting to changes:");
        System.out.println("    → Updating field mappings");
        System.out.println("    → Adding default values for new fields");
        System.out.println("    → Maintaining backward compatibility");
    }
}

/**
 * Filters log entries based on criteria.
 */
class FilteredLogTailer {
    private TransactionLog txLog;
    private Set<String> tableFilters = new HashSet<>();
    private Set<String> operationFilters = new HashSet<>();
    private Map<String, String> fieldFilters = new HashMap<>();

    public FilteredLogTailer(TransactionLog txLog) {
        this.txLog = txLog;
    }

    public void addTableFilter(String table) {
        tableFilters.add(table);
        System.out.println("  → Filter: table = " + table);
    }

    public void addOperationFilter(String... operations) {
        operationFilters.addAll(Arrays.asList(operations));
        System.out.println("  → Filter: operations = " + Arrays.toString(operations));
    }

    public void addFieldFilter(String field, String value) {
        fieldFilters.put(field, value);
        System.out.println("  → Filter: " + field + " = " + value);
    }

    /**
     * Processes changes with filters applied.
     */
    public void processFilteredChanges() {
        List<LogEntry> entries = txLog.getEntries();
        int matchCount = 0;

        for (LogEntry entry : entries) {
            if (matchesFilters(entry)) {
                System.out.println("  [MATCH] " + entry);
                matchCount++;
            }
        }

        System.out.println("  Total matches: " + matchCount + " out of " + entries.size());
    }

    private boolean matchesFilters(LogEntry entry) {
        if (!tableFilters.isEmpty() && !tableFilters.contains(entry.table)) {
            return false;
        }

        if (!operationFilters.isEmpty() && !operationFilters.contains(entry.operation)) {
            return false;
        }

        if (!fieldFilters.isEmpty() && entry.data != null) {
            for (Map.Entry<String, String> filter : fieldFilters.entrySet()) {
                if (!filter.getValue().equals(entry.data.get(filter.getKey()))) {
                    return false;
                }
            }
        }

        return true;
    }
}

/**
 * Simulates a replica database.
 */
class ReplicaDatabase {
    private Map<String, List<Map<String, String>>> tables = new HashMap<>();

    public void apply(LogEntry entry) {
        tables.computeIfAbsent(entry.table, k -> new ArrayList<>());
        System.out.println("  [REPLICA] Applied: " + entry.operation + " to " + entry.table);
    }

    public void verify() {
        System.out.println("  [REPLICA] State verification:");
        for (Map.Entry<String, List<Map<String, String>>> e : tables.entrySet()) {
            System.out.println("    " + e.getKey() + ": " + e.getValue().size() + " records");
        }
    }
}

/**
 * Manages real-time replication.
 */
class ReplicationManager {
    private TransactionLog primaryLog;
    private ReplicaDatabase replica;
    private long replicatedSequence = 0;

    public ReplicationManager(TransactionLog primaryLog, ReplicaDatabase replica) {
        this.primaryLog = primaryLog;
        this.replica = replica;
    }

    public void startReplication() {
        System.out.println("  [REPLICATION] Started");
    }

    public void replicate() {
        List<LogEntry> entries = primaryLog.getEntriesFrom(replicatedSequence);

        for (LogEntry entry : entries) {
            replica.apply(entry);
            replicatedSequence = entry.sequence;
        }

        System.out.println("  [REPLICATION] Replicated " + entries.size() + " changes");
    }
}

/**
 * Manages materialized views.
 */
class MaterializedViewManager {
    private TransactionLog txLog;
    private Map<String, String> views = new HashMap<>();
    private Map<String, Map<String, Object>> viewData = new HashMap<>();

    public MaterializedViewManager(TransactionLog txLog) {
        this.txLog = txLog;
    }

    public void createView(String viewName, String query) {
        views.put(viewName, query);
        viewData.put(viewName, new HashMap<>());
        System.out.println("  [VIEW] Created: " + viewName);
        System.out.println("    Query: " + query);
    }

    public void syncView(String viewName) {
        System.out.println("  [VIEW] Synchronizing: " + viewName);
        List<LogEntry> entries = txLog.getEntries();

        // Simulate aggregation
        Map<String, Integer> counts = new HashMap<>();
        for (LogEntry entry : entries) {
            if ("orders".equals(entry.table) && entry.data != null) {
                String customerId = entry.data.get("customer_id");
                if (customerId != null) {
                    counts.merge(customerId, 1, Integer::sum);
                }
            }
        }

        viewData.put(viewName, new HashMap<>(counts));
        System.out.println("  [VIEW] Synchronized " + counts.size() + " aggregate rows");
    }

    public void displayView(String viewName) {
        System.out.println("  [VIEW] Contents of " + viewName + ":");
        Map<String, Object> data = viewData.get(viewName);
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            System.out.println("    " + entry.getKey() + ": " + entry.getValue());
        }
    }
}

/**
 * Full synchronization pipeline.
 */
class SynchronizationPipeline {
    private TransactionLog txLog;
    private MessageBroker broker;
    private CDCConnector connector;
    private int eventsProcessed = 0;
    private int tablesMonitored = 0;

    public SynchronizationPipeline(TransactionLog txLog) {
        this.txLog = txLog;
        this.broker = new MessageBroker();
        this.connector = new CDCConnector(txLog, broker);
    }

    public void initialize() {
        System.out.println("  [PIPELINE] Initializing components");
        connector.start();
        System.out.println("  [PIPELINE] Ready to process changes");
    }

    public void processAllChanges() {
        List<LogEntry> entries = txLog.getEntries();
        eventsProcessed = entries.size();

        Set<String> tables = new HashSet<>();
        for (LogEntry entry : entries) {
            tables.add(entry.table);
            System.out.println("  [PIPELINE] Processing: " + entry);
        }

        tablesMonitored = tables.size();
        connector.processChanges();
    }

    public void printStatistics() {
        System.out.println("    • Total events processed: " + eventsProcessed);
        System.out.println("    • Tables monitored: " + tablesMonitored);
        System.out.println("    • Messages published: " + eventsProcessed);
        System.out.println("    • Pipeline latency: <10ms");
        System.out.println("    • Status: HEALTHY");
    }
}
