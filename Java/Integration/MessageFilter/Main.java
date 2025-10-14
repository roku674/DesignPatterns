package Integration.MessageFilter;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/**
 * MessageFilter Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Filters out unwanted messages from a channel based on specified criteria
 *
 * Key Concepts:
 * - Selective message processing
 * - Content-based filtering
 * - Property-based filtering
 * - Pattern matching
 *
 * When to Use:
 * - You need to filter out unwanted messages from a channel
 * - You want to process only relevant messages
 * - You require selective message routing
 * - You need to reduce message processing load
 * - You want to implement quality gates
 *
 * Benefits:
 * - Reduces processing overhead
 * - Improves system efficiency
 * - Enables selective processing
 * - Supports quality control
 * - Provides flexible filtering
 *
 * Real-World Scenarios:
 * 1. Spam filtering: Filter out spam messages
 * 2. Priority filtering: Only process high-priority messages
 * 3. Content filtering: Filter based on message content
 * 4. Type filtering: Filter by message type
 * 5. Time-based filtering: Filter messages by timestamp
 * 6. Size filtering: Filter messages exceeding size limits
 * 7. Duplicate filtering: Remove duplicate messages
 * 8. Validation filtering: Filter invalid messages
 * 9. Security filtering: Filter unauthorized messages
 * 10. Rate limiting: Filter excess messages
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "MessageFilter";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(43) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Filters out unwanted messages from a channel based on specified criteria");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing MessageFilter infrastructure...");
        MessagingInfrastructure infrastructure = new MessagingInfrastructure();
        MessageFilterEngine filter = new MessageFilterEngine(infrastructure);
        System.out.println("  ✓ Message channels created");
        System.out.println("  ✓ Filter engine initialized");
        System.out.println("  ✓ Infrastructure ready");
        System.out.println();

        // Scenario 1: Spam filtering
        demonstrateSpamFiltering(filter, infrastructure);

        // Scenario 2: Priority filtering
        demonstratePriorityFiltering(filter, infrastructure);

        // Scenario 3: Content filtering
        demonstrateContentFiltering(filter, infrastructure);

        // Scenario 4: Type filtering
        demonstrateTypeFiltering(filter, infrastructure);

        // Scenario 5: Time-based filtering
        demonstrateTimeBasedFiltering(filter, infrastructure);

        // Scenario 6: Size filtering
        demonstrateSizeFiltering(filter, infrastructure);

        // Scenario 7: Duplicate filtering
        demonstrateDuplicateFiltering(filter, infrastructure);

        // Scenario 8: Validation filtering
        demonstrateValidationFiltering(filter, infrastructure);

        // Scenario 9: Security filtering
        demonstrateSecurityFiltering(filter, infrastructure);

        // Scenario 10: Rate limiting
        demonstrateRateLimiting(filter, infrastructure);

        // Summary
        printSummary(infrastructure);

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    /**
     * Demonstrates spam message filtering.
     * Filters out messages identified as spam.
     */
    private static void demonstrateSpamFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Spam Filtering", "Filter out spam messages");

        Set<String> spamKeywords = new HashSet<>(Arrays.asList("viagra", "lottery", "winner", "free money"));

        filter.setFilter(msg -> {
            String content = msg.getContent().toLowerCase();
            return spamKeywords.stream().noneMatch(content::contains);
        });

        String[] messages = {
                "Hello, how are you?",
                "You won the lottery!!!",
                "Meeting at 3pm",
                "FREE MONEY click here",
                "Project update attached"
        };

        int accepted = 0;
        int rejected = 0;

        for (String content : messages) {
            Message message = new Message("email", "sender@example.com", content);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: " + content);
            } else {
                rejected++;
                printInfo("✗ Rejected (spam): " + content);
            }
        }

        printSuccess("Spam filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates priority-based filtering.
     * Only processes high-priority messages.
     */
    private static void demonstratePriorityFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Priority Filtering", "Only process high-priority messages");

        filter.setFilter(msg -> {
            String priority = msg.getHeaders().getOrDefault("priority", "normal");
            return priority.equals("high") || priority.equals("critical");
        });

        String[] priorities = {"low", "normal", "high", "critical", "low", "high"};
        int accepted = 0;
        int rejected = 0;

        for (int i = 0; i < priorities.length; i++) {
            Message message = new Message("task", "system", "Task " + (i + 1));
            message.addHeader("priority", priorities[i]);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: Priority=" + priorities[i]);
            } else {
                rejected++;
                printInfo("✗ Rejected: Priority=" + priorities[i]);
            }
        }

        printSuccess("Priority filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates content-based filtering.
     * Filters messages based on content patterns.
     */
    private static void demonstrateContentFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Content Filtering", "Filter based on message content");

        Pattern errorPattern = Pattern.compile(".*ERROR.*|.*FATAL.*", Pattern.CASE_INSENSITIVE);

        filter.setFilter(msg -> {
            return errorPattern.matcher(msg.getContent()).matches();
        });

        String[] contents = {
                "INFO: Application started",
                "ERROR: Database connection failed",
                "DEBUG: Processing request",
                "FATAL: Out of memory",
                "INFO: User logged in"
        };

        int accepted = 0;
        int rejected = 0;

        for (String content : contents) {
            Message message = new Message("log", "app", content);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: " + content);
            } else {
                rejected++;
                printInfo("✗ Rejected: " + content);
            }
        }

        printSuccess("Content filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates type-based filtering.
     * Filters messages by type.
     */
    private static void demonstrateTypeFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Type Filtering", "Filter by message type");

        Set<String> allowedTypes = new HashSet<>(Arrays.asList("order", "payment", "invoice"));

        filter.setFilter(msg -> allowedTypes.contains(msg.getType()));

        String[] types = {"order", "notification", "payment", "analytics", "invoice", "report"};
        int accepted = 0;
        int rejected = 0;

        for (String type : types) {
            Message message = new Message(type, "user", "Message of type " + type);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: Type=" + type);
            } else {
                rejected++;
                printInfo("✗ Rejected: Type=" + type);
            }
        }

        printSuccess("Type filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates time-based filtering.
     * Filters messages based on timestamp.
     */
    private static void demonstrateTimeBasedFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Time-Based Filtering", "Filter messages by timestamp");

        long currentTime = System.currentTimeMillis();
        long fiveMinutesAgo = currentTime - (5 * 60 * 1000);

        filter.setFilter(msg -> msg.getTimestamp() >= fiveMinutesAgo);

        int accepted = 0;
        int rejected = 0;

        for (int i = 0; i < 6; i++) {
            long timestamp = currentTime - (i * 60 * 1000); // Each message 1 minute apart
            Message message = new Message("event", "sensor", "Event " + (i + 1));
            message.setTimestamp(timestamp);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: Message from " + i + " minutes ago");
            } else {
                rejected++;
                printInfo("✗ Rejected: Message from " + i + " minutes ago");
            }
        }

        printSuccess("Time-based filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates size-based filtering.
     * Filters messages exceeding size limits.
     */
    private static void demonstrateSizeFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Size Filtering", "Filter messages exceeding size limits");

        int maxSize = 100;

        filter.setFilter(msg -> msg.getContent().length() <= maxSize);

        String[] contents = {
                "Short message",
                "This is a medium length message that should still pass",
                new String(new char[150]).replace('\0', 'x'), // Very long message
                "Another short one",
                new String(new char[200]).replace('\0', 'y') // Another long message
        };

        int accepted = 0;
        int rejected = 0;

        for (String content : contents) {
            Message message = new Message("data", "sender", content);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: Size=" + content.length() + " bytes");
            } else {
                rejected++;
                printInfo("✗ Rejected: Size=" + content.length() + " bytes (exceeds " + maxSize + ")");
            }
        }

        printSuccess("Size filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates duplicate message filtering.
     * Removes duplicate messages.
     */
    private static void demonstrateDuplicateFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Duplicate Filtering", "Remove duplicate messages");

        Set<String> seenMessageIds = new HashSet<>();

        filter.setFilter(msg -> {
            String messageId = msg.getHeaders().getOrDefault("messageId", "");
            return seenMessageIds.add(messageId);
        });

        String[] messageIds = {"msg_1", "msg_2", "msg_1", "msg_3", "msg_2", "msg_4"};
        int accepted = 0;
        int rejected = 0;

        for (String msgId : messageIds) {
            Message message = new Message("data", "sender", "Content for " + msgId);
            message.addHeader("messageId", msgId);
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: " + msgId + " (first occurrence)");
            } else {
                rejected++;
                printInfo("✗ Rejected: " + msgId + " (duplicate)");
            }
        }

        printSuccess("Duplicate filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates validation filtering.
     * Filters invalid messages.
     */
    private static void demonstrateValidationFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Validation Filtering", "Filter invalid messages");

        filter.setFilter(msg -> {
            // Validate required fields
            if (msg.getContent() == null || msg.getContent().isEmpty()) return false;
            if (msg.getSender() == null || msg.getSender().isEmpty()) return false;

            // Validate email format if present
            String email = msg.getHeaders().get("email");
            if (email != null && !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) return false;

            return true;
        });

        Message[] messages = {
                createTestMessage("order", "user1", "Valid order", "user1@example.com"),
                createTestMessage("order", "", "No sender", null),
                createTestMessage("order", "user2", "", null),
                createTestMessage("order", "user3", "Valid order", "invalid-email"),
                createTestMessage("order", "user4", "Valid order", "user4@example.com")
        };

        int accepted = 0;
        int rejected = 0;

        for (int i = 0; i < messages.length; i++) {
            boolean passed = filter.filter(messages[i]);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: Message " + (i + 1) + " (valid)");
            } else {
                rejected++;
                printInfo("✗ Rejected: Message " + (i + 1) + " (invalid)");
            }
        }

        printSuccess("Validation filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates security filtering.
     * Filters unauthorized messages.
     */
    private static void demonstrateSecurityFiltering(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Security Filtering", "Filter unauthorized messages");

        Set<String> authorizedUsers = new HashSet<>(Arrays.asList("admin", "user1", "user2"));

        filter.setFilter(msg -> {
            String sender = msg.getSender();
            String token = msg.getHeaders().get("auth_token");

            // Check if user is authorized and has valid token
            return authorizedUsers.contains(sender) && token != null && !token.isEmpty();
        });

        String[] senders = {"admin", "user1", "unauthorized", "user2", "hacker"};
        boolean[] hasToken = {true, true, true, false, true};
        int accepted = 0;
        int rejected = 0;

        for (int i = 0; i < senders.length; i++) {
            Message message = new Message("request", senders[i], "Request from " + senders[i]);
            if (hasToken[i]) {
                message.addHeader("auth_token", "token_" + senders[i]);
            }
            boolean passed = filter.filter(message);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: " + senders[i] + " (authorized)");
            } else {
                rejected++;
                printInfo("✗ Rejected: " + senders[i] + " (unauthorized)");
            }
        }

        printSuccess("Security filtering completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Demonstrates rate limiting filtering.
     * Filters excess messages based on rate limits.
     */
    private static void demonstrateRateLimiting(MessageFilterEngine filter, MessagingInfrastructure infrastructure) {
        startScenario("Rate Limiting", "Filter excess messages");

        Map<String, Integer> messageCounts = new HashMap<>();
        int maxMessagesPerUser = 3;

        filter.setFilter(msg -> {
            String sender = msg.getSender();
            int count = messageCounts.getOrDefault(sender, 0);
            if (count < maxMessagesPerUser) {
                messageCounts.put(sender, count + 1);
                return true;
            }
            return false;
        });

        String[] senders = {"user1", "user2", "user1", "user1", "user2", "user1", "user2", "user2"};
        int accepted = 0;
        int rejected = 0;

        for (int i = 0; i < senders.length; i++) {
            Message message = new Message("request", senders[i], "Request " + (i + 1));
            boolean passed = filter.filter(message);
            int currentCount = messageCounts.getOrDefault(senders[i], 0);
            if (passed) {
                accepted++;
                printInfo("✓ Accepted: " + senders[i] + " (" + currentCount + "/" + maxMessagesPerUser + ")");
            } else {
                rejected++;
                printInfo("✗ Rejected: " + senders[i] + " (rate limit exceeded)");
            }
        }

        printSuccess("Rate limiting completed: " + accepted + " accepted, " + rejected + " rejected");
        endScenario();
    }

    /**
     * Creates a test message with email header.
     */
    private static Message createTestMessage(String type, String sender, String content, String email) {
        Message message = new Message(type, sender, content);
        if (email != null) {
            message.addHeader("email", email);
        }
        return message;
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
        System.out.println("  Messages filtered: " + infrastructure.getFilteredCount());
        System.out.println("  Messages passed: " + infrastructure.getPassedCount());
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
        System.out.println("  " + message);
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
    private long timestamp;

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

    /**
     * Sets the message timestamp.
     */
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}

/**
 * Message filter engine that filters messages based on predicates.
 */
class MessageFilterEngine {
    private final MessagingInfrastructure infrastructure;
    private Predicate<Message> filterPredicate;

    /**
     * Creates a new message filter.
     *
     * @param infrastructure The messaging infrastructure
     */
    public MessageFilterEngine(MessagingInfrastructure infrastructure) {
        this.infrastructure = infrastructure;
        this.filterPredicate = msg -> true; // Accept all by default
    }

    /**
     * Sets the filter predicate.
     *
     * @param predicate The filter predicate
     */
    public void setFilter(Predicate<Message> predicate) {
        this.filterPredicate = predicate;
    }

    /**
     * Filters a message based on the current predicate.
     *
     * @param message The message to filter
     * @return true if message passes filter, false otherwise
     */
    public boolean filter(Message message) {
        boolean passed = filterPredicate.test(message);
        if (passed) {
            infrastructure.incrementPassed();
        } else {
            infrastructure.incrementFiltered();
        }
        return passed;
    }
}

/**
 * Messaging infrastructure that tracks filter statistics.
 */
class MessagingInfrastructure {
    private int filteredCount;
    private int passedCount;

    /**
     * Creates new messaging infrastructure.
     */
    public MessagingInfrastructure() {
        this.filteredCount = 0;
        this.passedCount = 0;
    }

    /**
     * Increments the filtered message count.
     */
    public void incrementFiltered() {
        filteredCount++;
    }

    /**
     * Increments the passed message count.
     */
    public void incrementPassed() {
        passedCount++;
    }

    /**
     * Gets the number of filtered messages.
     *
     * @return The filtered message count
     */
    public int getFilteredCount() {
        return filteredCount;
    }

    /**
     * Gets the number of passed messages.
     *
     * @return The passed message count
     */
    public int getPassedCount() {
        return passedCount;
    }
}
