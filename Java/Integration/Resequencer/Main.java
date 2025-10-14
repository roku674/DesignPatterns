package Integration.Resequencer;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * Resequencer Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Converts a stream of out-of-sequence messages back into correct order
 *
 * Key Concepts:
 * - Reorders out-of-sequence messages
 * - Uses sequence numbers
 * - Buffers messages until in order
 * - Handles missing messages
 *
 * When to Use:
 * - You need to convert a stream of out-of-sequence messages back into correct order
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
 * 1. Network packets: Reorder TCP packets
 * 2. Event ordering: Maintain event sequence
 * 3. Transaction logs: Reorder log entries
 * 4. Video frames: Reorder streaming frames
 * 5. Database changes: Maintain change order
 * 6. Message queue ordering: Restore message order
 * 7. Distributed events: Order events from multiple sources
 * 8. File chunks: Reassemble file parts
 * 9. Command sequencing: Execute commands in order
 * 10. Data stream ordering: Order streaming data
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "Resequencer";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        System.out.println("Description:");
        System.out.println("  Converts a stream of out-of-sequence messages back into correct order");
        System.out.println();

        System.out.println("Initializing Resequencer infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        MessageResequencer resequencer = new MessageResequencer(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Resequencer engine initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        demonstrateNetworkPackets(resequencer, infrastructure);
        demonstrateEventOrdering(resequencer, infrastructure);
        demonstrateTransactionLogs(resequencer, infrastructure);
        demonstrateVideoFrames(resequencer, infrastructure);
        demonstrateDatabaseChanges(resequencer, infrastructure);
        demonstrateMessageQueueOrdering(resequencer, infrastructure);
        demonstrateDistributedEvents(resequencer, infrastructure);
        demonstrateFileChunks(resequencer, infrastructure);
        demonstrateCommandSequencing(resequencer, infrastructure);
        demonstrateDataStreamOrdering(resequencer, infrastructure);

        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    private static void demonstrateNetworkPackets(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Network Packets", "Reorder TCP packets");

        String correlationId = "tcp_stream_001";

        printStep("Packets arriving out of order");
        resequencer.addMessage(createMessage("packet", "Packet data 2", correlationId, 2, 5));
        resequencer.addMessage(createMessage("packet", "Packet data 4", correlationId, 4, 5));
        resequencer.addMessage(createMessage("packet", "Packet data 0", correlationId, 0, 5));
        resequencer.addMessage(createMessage("packet", "Packet data 3", correlationId, 3, 5));
        resequencer.addMessage(createMessage("packet", "Packet data 1", correlationId, 1, 5));

        printInfo("  Received: 2, 4, 0, 3, 1");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Resequenced: 0, 1, 2, 3, 4");
            printInfo("  Stream reconstructed correctly");
        }

        printSuccess("Network packet resequencing completed");
        endScenario();
    }

    private static void demonstrateEventOrdering(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Event Ordering", "Maintain event sequence");

        String correlationId = "event_sequence_abc";

        printStep("Events arriving out of order");
        resequencer.addMessage(createMessage("event", "User logged in", correlationId, 0, 4));
        resequencer.addMessage(createMessage("event", "User logged out", correlationId, 3, 4));
        resequencer.addMessage(createMessage("event", "User updated profile", correlationId, 1, 4));
        resequencer.addMessage(createMessage("event", "User made purchase", correlationId, 2, 4));

        printInfo("  Received: login, logout, update, purchase");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Resequenced: login, update, purchase, logout");
            printInfo("  Event timeline restored");
        }

        printSuccess("Event ordering completed");
        endScenario();
    }

    private static void demonstrateTransactionLogs(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Transaction Logs", "Reorder log entries");

        String correlationId = "transaction_log_456";

        printStep("Log entries arriving out of order");
        resequencer.addMessage(createMessage("log", "BEGIN TRANSACTION", correlationId, 0, 5));
        resequencer.addMessage(createMessage("log", "COMMIT", correlationId, 4, 5));
        resequencer.addMessage(createMessage("log", "UPDATE accounts SET...", correlationId, 2, 5));
        resequencer.addMessage(createMessage("log", "INSERT INTO audit...", correlationId, 3, 5));
        resequencer.addMessage(createMessage("log", "SELECT balance FROM...", correlationId, 1, 5));

        printInfo("  Log entries received in random order");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Transaction log resequenced");
            printInfo("  Correct execution order restored");
        }

        printSuccess("Transaction log resequencing completed");
        endScenario();
    }

    private static void demonstrateVideoFrames(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Video Frames", "Reorder streaming frames");

        String correlationId = "video_stream_xyz";

        printStep("Video frames arriving out of order");
        resequencer.addMessage(createMessage("frame", "Frame 5", correlationId, 5, 6));
        resequencer.addMessage(createMessage("frame", "Frame 1", correlationId, 1, 6));
        resequencer.addMessage(createMessage("frame", "Frame 3", correlationId, 3, 6));
        resequencer.addMessage(createMessage("frame", "Frame 0", correlationId, 0, 6));
        resequencer.addMessage(createMessage("frame", "Frame 4", correlationId, 4, 6));
        resequencer.addMessage(createMessage("frame", "Frame 2", correlationId, 2, 6));

        printInfo("  Received: 5, 1, 3, 0, 4, 2");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Frames resequenced: 0, 1, 2, 3, 4, 5");
            printInfo("  Smooth playback restored");
        }

        printSuccess("Video frame resequencing completed");
        endScenario();
    }

    private static void demonstrateDatabaseChanges(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Database Changes", "Maintain change order");

        String correlationId = "db_changes_789";

        printStep("Database changes arriving out of order");
        resequencer.addMessage(createMessage("change", "CREATE TABLE users", correlationId, 0, 4));
        resequencer.addMessage(createMessage("change", "CREATE INDEX idx_email", correlationId, 3, 4));
        resequencer.addMessage(createMessage("change", "INSERT INTO users...", correlationId, 2, 4));
        resequencer.addMessage(createMessage("change", "ALTER TABLE users ADD...", correlationId, 1, 4));

        printInfo("  Changes received in wrong order");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Changes resequenced correctly");
            printInfo("  Database migration order preserved");
        }

        printSuccess("Database change resequencing completed");
        endScenario();
    }

    private static void demonstrateMessageQueueOrdering(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Message Queue Ordering", "Restore message order");

        String correlationId = "queue_batch_111";

        printStep("Messages from queue arriving out of order");
        resequencer.addMessage(createMessage("queue_msg", "Message 3", correlationId, 3, 5));
        resequencer.addMessage(createMessage("queue_msg", "Message 0", correlationId, 0, 5));
        resequencer.addMessage(createMessage("queue_msg", "Message 4", correlationId, 4, 5));
        resequencer.addMessage(createMessage("queue_msg", "Message 1", correlationId, 1, 5));
        resequencer.addMessage(createMessage("queue_msg", "Message 2", correlationId, 2, 5));

        printInfo("  Received: 3, 0, 4, 1, 2");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Messages reordered: 0, 1, 2, 3, 4");
            printInfo("  Original order restored");
        }

        printSuccess("Message queue ordering completed");
        endScenario();
    }

    private static void demonstrateDistributedEvents(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Distributed Events", "Order events from multiple sources");

        String correlationId = "distributed_events_222";

        printStep("Events from 3 servers arriving out of order");
        resequencer.addMessage(createMessage("event", "Server2: Event B", correlationId, 2, 6));
        resequencer.addMessage(createMessage("event", "Server1: Event A", correlationId, 1, 6));
        resequencer.addMessage(createMessage("event", "Start marker", correlationId, 0, 6));
        resequencer.addMessage(createMessage("event", "Server2: Event D", correlationId, 4, 6));
        resequencer.addMessage(createMessage("event", "Server3: Event C", correlationId, 3, 6));
        resequencer.addMessage(createMessage("event", "End marker", correlationId, 5, 6));

        printInfo("  Events from distributed sources");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Events resequenced chronologically");
            printInfo("  Distributed timeline reconstructed");
        }

        printSuccess("Distributed event ordering completed");
        endScenario();
    }

    private static void demonstrateFileChunks(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("File Chunks", "Reassemble file parts");

        String correlationId = "file_upload_333";

        printStep("File chunks arriving out of order");
        resequencer.addMessage(createMessage("chunk", "Chunk 2: ...data...", correlationId, 2, 4));
        resequencer.addMessage(createMessage("chunk", "Chunk 0: ...data...", correlationId, 0, 4));
        resequencer.addMessage(createMessage("chunk", "Chunk 3: ...data...", correlationId, 3, 4));
        resequencer.addMessage(createMessage("chunk", "Chunk 1: ...data...", correlationId, 1, 4));

        printInfo("  Received: 2, 0, 3, 1");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Chunks reordered: 0, 1, 2, 3");
            printInfo("  File reassembled correctly");
        }

        printSuccess("File chunk resequencing completed");
        endScenario();
    }

    private static void demonstrateCommandSequencing(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Command Sequencing", "Execute commands in order");

        String correlationId = "command_batch_444";

        printStep("Commands arriving out of order");
        resequencer.addMessage(createMessage("command", "SAVE", correlationId, 2, 4));
        resequencer.addMessage(createMessage("command", "INIT", correlationId, 0, 4));
        resequencer.addMessage(createMessage("command", "CLEANUP", correlationId, 3, 4));
        resequencer.addMessage(createMessage("command", "PROCESS", correlationId, 1, 4));

        printInfo("  Commands need execution in specific order");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Commands resequenced: INIT, PROCESS, SAVE, CLEANUP");
            printInfo("  Execution order guaranteed");
        }

        printSuccess("Command sequencing completed");
        endScenario();
    }

    private static void demonstrateDataStreamOrdering(MessageResequencer resequencer, MessagingInfrastructure infrastructure) {
        startScenario("Data Stream Ordering", "Order streaming data");

        String correlationId = "data_stream_555";

        printStep("Data points arriving out of order");
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 45.2°C", correlationId, 4, 6));
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 40.1°C", correlationId, 0, 6));
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 42.5°C", correlationId, 2, 6));
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 43.8°C", correlationId, 3, 6));
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 46.0°C", correlationId, 5, 6));
        resequencer.addMessage(createMessage("data_point", "Sensor reading: 41.3°C", correlationId, 1, 6));

        printInfo("  Data points from sensor stream");

        List<Message> ordered = resequencer.getOrderedMessages(correlationId);
        if (ordered != null) {
            printInfo("✓ Data stream resequenced");
            printInfo("  Chronological order restored");
        }

        printSuccess("Data stream ordering completed");
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
        System.out.println("  Messages resequenced: " + infrastructure.getResequencedCount());
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

    public int getSequence() {
        return Integer.parseInt(headers.get("sequence"));
    }
}

class MessageResequencer {
    private final MessagingInfrastructure infrastructure;
    private final Map<String, TreeMap<Integer, Message>> sequenceBuffers;

    public MessageResequencer(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
        this.sequenceBuffers = new ConcurrentHashMap<>();
    }

    public void addMessage(Message message) {
        String correlationId = message.getHeaders().get("correlation_id");
        int sequence = message.getSequence();

        sequenceBuffers.computeIfAbsent(correlationId, k -> new TreeMap<>()).put(sequence, message);
    }

    public List<Message> getOrderedMessages(String correlationId) {
        TreeMap<Integer, Message> buffer = sequenceBuffers.get(correlationId);
        if (buffer == null || buffer.isEmpty()) {
            return null;
        }

        int expectedTotal = Integer.parseInt(buffer.firstEntry().getValue().getHeaders().get("total"));

        if (buffer.size() == expectedTotal) {
            List<Message> orderedMessages = new ArrayList<>(buffer.values());
            sequenceBuffers.remove(correlationId);
            infrastructure.incrementResequencedCount();
            return orderedMessages;
        }

        return null;
    }
}

class MessagingInfrastructure {
    private int resequencedCount;

    public MessagingInfrastructure() {
        this.resequencedCount = 0;
    }

    public void incrementResequencedCount() {
        resequencedCount++;
    }

    public int getResequencedCount() {
        return resequencedCount;
    }
}
