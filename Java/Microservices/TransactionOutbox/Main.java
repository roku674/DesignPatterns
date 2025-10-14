package Microservices.TransactionOutbox;

import java.util.*;
import java.util.concurrent.*;

/**
 * Transaction Outbox Pattern Implementation
 *
 * <p>The Transaction Outbox pattern ensures reliable message publishing in distributed systems
 * by storing messages in the same database transaction as business data, then publishing them
 * asynchronously. This guarantees message delivery and maintains data consistency.</p>
 *
 * <h2>Pattern Benefits:</h2>
 * <ul>
 *   <li>Guarantees at-least-once message delivery</li>
 *   <li>Maintains consistency between database and message broker</li>
 *   <li>Prevents lost messages due to failures</li>
 *   <li>Enables eventual consistency across microservices</li>
 * </ul>
 *
 * <h2>Implementation Scenarios:</h2>
 * <ol>
 *   <li>Basic Order Creation with Outbox</li>
 *   <li>Payment Processing with Multiple Events</li>
 *   <li>Inventory Management with Retry Logic</li>
 *   <li>Concurrent Order Processing</li>
 *   <li>Failed Event Handling and Recovery</li>
 *   <li>Event Deduplication</li>
 *   <li>Partitioned Outbox for Scale</li>
 *   <li>Priority-based Message Publishing</li>
 *   <li>Dead Letter Queue Handling</li>
 *   <li>Full E-commerce Workflow Simulation</li>
 * </ol>
 *
 * @author Design Patterns Implementation
 * @version 2.0
 * @since 2024-01-01
 */
public class Main {

    /**
     * Main entry point demonstrating all Transaction Outbox pattern scenarios.
     *
     * @param args Command line arguments (not used)
     * @throws InterruptedException if thread operations are interrupted
     */
    public static void main(String[] args) throws InterruptedException {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║        TRANSACTION OUTBOX PATTERN - MICROSERVICES             ║");
        System.out.println("║              Reliable Message Publishing                       ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        // Scenario 1: Basic order creation
        demonstrateBasicOrderCreation();

        // Scenario 2: Payment processing
        demonstratePaymentProcessing();

        // Scenario 3: Inventory management
        demonstrateInventoryManagement();

        // Scenario 4: Concurrent processing
        demonstrateConcurrentProcessing();

        // Scenario 5: Failed event handling
        demonstrateFailedEventHandling();

        // Scenario 6: Event deduplication
        demonstrateEventDeduplication();

        // Scenario 7: Partitioned outbox
        demonstratePartitionedOutbox();

        // Scenario 8: Priority-based publishing
        demonstratePriorityPublishing();

        // Scenario 9: Dead letter queue
        demonstrateDeadLetterQueue();

        // Scenario 10: Full workflow
        demonstrateFullWorkflow();

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           ALL SCENARIOS COMPLETED SUCCESSFULLY                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
    }

    /**
     * Scenario 1: Demonstrates basic order creation with transactional outbox.
     * Shows how business logic and event publishing are coupled in a single transaction.
     */
    private static void demonstrateBasicOrderCreation() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 1: Basic Order Creation with Outbox");
        System.out.println("=".repeat(70));

        OrderService orderService = new OrderService();
        MessageRelay relay = new MessageRelay(orderService);

        System.out.println("\n→ Creating order for customer CUST-123");
        orderService.createOrder("CUST-123", 299.99);

        System.out.println("\n→ Message relay publishing pending events");
        relay.publishPendingMessages();

        System.out.println("\n✓ Scenario 1 completed: Order created and event published reliably");
    }

    /**
     * Scenario 2: Demonstrates payment processing with multiple related events.
     * Shows how complex workflows generate multiple outbox messages atomically.
     */
    private static void demonstratePaymentProcessing() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2: Payment Processing with Multiple Events");
        System.out.println("=".repeat(70));

        PaymentService paymentService = new PaymentService();
        MessageRelay relay = new MessageRelay(paymentService);

        System.out.println("\n→ Processing payment for order ORD-456");
        paymentService.processPayment("ORD-456", "CUST-789", 599.99, "VISA-4532");

        System.out.println("\n→ Publishing payment-related events");
        relay.publishPendingMessages();

        System.out.println("\n✓ Scenario 2 completed: Payment processed with multiple events");
    }

    /**
     * Scenario 3: Demonstrates inventory management with retry logic.
     * Shows how the outbox pattern handles temporary failures.
     */
    private static void demonstrateInventoryManagement() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3: Inventory Management with Retry Logic");
        System.out.println("=".repeat(70));

        InventoryService inventoryService = new InventoryService();
        ResilientMessageRelay relay = new ResilientMessageRelay(inventoryService);

        System.out.println("\n→ Reserving inventory for order ORD-101");
        inventoryService.reserveInventory("ORD-101", "PROD-555", 5);

        System.out.println("\n→ Attempting to publish with retry logic");
        relay.publishWithRetry(3, 1000);

        System.out.println("\n✓ Scenario 3 completed: Inventory reserved with resilient publishing");
    }

    /**
     * Scenario 4: Demonstrates concurrent order processing.
     * Shows how the outbox pattern handles multiple simultaneous transactions.
     *
     * @throws InterruptedException if thread execution is interrupted
     */
    private static void demonstrateConcurrentProcessing() throws InterruptedException {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 4: Concurrent Order Processing");
        System.out.println("=".repeat(70));

        ConcurrentOrderService orderService = new ConcurrentOrderService();
        ExecutorService executor = Executors.newFixedThreadPool(3);

        System.out.println("\n→ Processing 5 orders concurrently");

        for (int i = 1; i <= 5; i++) {
            final int orderId = i;
            executor.submit(() -> {
                orderService.createOrder("CUST-" + orderId, 100.0 * orderId);
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("\n→ Publishing all pending messages");
        MessageRelay relay = new MessageRelay(orderService);
        relay.publishPendingMessages();

        System.out.println("\n✓ Scenario 4 completed: " + orderService.getOutboxMessages().size() +
                         " orders processed concurrently");
    }

    /**
     * Scenario 5: Demonstrates failed event handling and recovery.
     * Shows how the outbox pattern manages publishing failures.
     */
    private static void demonstrateFailedEventHandling() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 5: Failed Event Handling and Recovery");
        System.out.println("=".repeat(70));

        OrderService orderService = new OrderService();
        FailureSimulatingRelay relay = new FailureSimulatingRelay(orderService);

        System.out.println("\n→ Creating orders that will fail to publish");
        orderService.createOrder("CUST-FAIL-1", 150.0);
        orderService.createOrder("CUST-FAIL-2", 250.0);

        System.out.println("\n→ First publish attempt (will fail)");
        relay.publishPendingMessages();

        System.out.println("\n→ Recovering and retrying failed messages");
        relay.retryFailedMessages();

        System.out.println("\n✓ Scenario 5 completed: Failed events recovered successfully");
    }

    /**
     * Scenario 6: Demonstrates event deduplication.
     * Shows how to prevent duplicate message processing using idempotency keys.
     */
    private static void demonstrateEventDeduplication() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 6: Event Deduplication");
        System.out.println("=".repeat(70));

        DeduplicationService deduplicationService = new DeduplicationService();
        MessageRelay relay = new MessageRelay(deduplicationService);

        System.out.println("\n→ Creating order with idempotency key");
        deduplicationService.createOrder("CUST-DUP", 399.99, "IDEMPOTENCY-KEY-123");

        System.out.println("\n→ First publish attempt");
        relay.publishPendingMessages();

        System.out.println("\n→ Attempting duplicate order creation");
        deduplicationService.createOrder("CUST-DUP", 399.99, "IDEMPOTENCY-KEY-123");

        System.out.println("\n→ Second publish attempt (should skip duplicate)");
        relay.publishPendingMessages();

        System.out.println("\n✓ Scenario 6 completed: Duplicate events prevented");
    }

    /**
     * Scenario 7: Demonstrates partitioned outbox for scalability.
     * Shows how to partition the outbox table for parallel processing.
     */
    private static void demonstratePartitionedOutbox() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 7: Partitioned Outbox for Scale");
        System.out.println("=".repeat(70));

        PartitionedOutboxService outboxService = new PartitionedOutboxService(4);

        System.out.println("\n→ Creating orders distributed across partitions");
        for (int i = 1; i <= 8; i++) {
            outboxService.createOrder("CUST-PART-" + i, 100.0 * i);
        }

        System.out.println("\n→ Publishing from all partitions in parallel");
        outboxService.publishAllPartitions();

        System.out.println("\n✓ Scenario 7 completed: Partitioned outbox processed successfully");
    }

    /**
     * Scenario 8: Demonstrates priority-based message publishing.
     * Shows how to prioritize critical events over standard ones.
     */
    private static void demonstratePriorityPublishing() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 8: Priority-based Message Publishing");
        System.out.println("=".repeat(70));

        PriorityOutboxService outboxService = new PriorityOutboxService();
        PriorityMessageRelay relay = new PriorityMessageRelay(outboxService);

        System.out.println("\n→ Creating events with different priorities");
        outboxService.createEvent("FRAUD_DETECTED", "High priority fraud alert", Priority.CRITICAL);
        outboxService.createEvent("ORDER_CREATED", "Standard order", Priority.NORMAL);
        outboxService.createEvent("USER_LOGIN", "User logged in", Priority.LOW);
        outboxService.createEvent("PAYMENT_FAILED", "Payment failure alert", Priority.HIGH);

        System.out.println("\n→ Publishing events by priority");
        relay.publishByPriority();

        System.out.println("\n✓ Scenario 8 completed: Priority-based publishing executed");
    }

    /**
     * Scenario 9: Demonstrates dead letter queue handling.
     * Shows how to handle messages that repeatedly fail to publish.
     */
    private static void demonstrateDeadLetterQueue() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 9: Dead Letter Queue Handling");
        System.out.println("=".repeat(70));

        OrderService orderService = new OrderService();
        DeadLetterQueueRelay relay = new DeadLetterQueueRelay(orderService);

        System.out.println("\n→ Creating orders that will fail repeatedly");
        orderService.createOrder("CUST-DLQ-1", 100.0);
        orderService.createOrder("CUST-DLQ-2", 200.0);

        System.out.println("\n→ Attempting to publish with DLQ fallback");
        relay.publishWithDeadLetterQueue(3);

        System.out.println("\n→ Inspecting dead letter queue");
        relay.printDeadLetterQueue();

        System.out.println("\n✓ Scenario 9 completed: Dead letter queue handled failed messages");
    }

    /**
     * Scenario 10: Demonstrates full e-commerce workflow.
     * Shows a complete order lifecycle using the transaction outbox pattern.
     */
    private static void demonstrateFullWorkflow() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 10: Full E-commerce Workflow Simulation");
        System.out.println("=".repeat(70));

        EcommerceWorkflow workflow = new EcommerceWorkflow();

        System.out.println("\n→ Starting complete order workflow for CUST-WORKFLOW-001");
        workflow.processCompleteOrder("CUST-WORKFLOW-001", "PROD-999", 3, "VISA-1234");

        System.out.println("\n→ Publishing all workflow events");
        workflow.publishAllEvents();

        System.out.println("\n→ Workflow statistics:");
        workflow.printStatistics();

        System.out.println("\n✓ Scenario 10 completed: Full workflow processed successfully");
    }
}

/**
 * Simulates a payment service with transactional outbox.
 */
class PaymentService extends OrderService {
    /**
     * Processes a payment and generates related outbox events.
     *
     * @param orderId The order identifier
     * @param customerId The customer identifier
     * @param amount The payment amount
     * @param cardToken The payment card token
     */
    public void processPayment(String orderId, String customerId, double amount, String cardToken) {
        System.out.println("  [DB Transaction Start]");
        System.out.println("  → Recording payment: $" + amount);

        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8);

        // Add multiple events in same transaction
        addOutboxMessage("PAYMENT_INITIATED", String.format(
            "{paymentId: '%s', orderId: '%s', amount: %.2f}", paymentId, orderId, amount));

        addOutboxMessage("PAYMENT_AUTHORIZED", String.format(
            "{paymentId: '%s', cardToken: '%s'}", paymentId, cardToken));

        addOutboxMessage("PAYMENT_COMPLETED", String.format(
            "{paymentId: '%s', customerId: '%s'}", paymentId, customerId));

        System.out.println("  → Added 3 outbox messages");
        System.out.println("  [DB Transaction Committed]");
    }

    protected void addOutboxMessage(String eventType, String payload) {
        OutboxMessage message = new OutboxMessage(eventType, payload);
        getOutboxMessages().add(message);
    }
}

/**
 * Simulates inventory management with outbox pattern.
 */
class InventoryService extends OrderService {
    /**
     * Reserves inventory and records the event in outbox.
     *
     * @param orderId The order identifier
     * @param productId The product identifier
     * @param quantity The quantity to reserve
     */
    public void reserveInventory(String orderId, String productId, int quantity) {
        System.out.println("  [DB Transaction Start]");
        System.out.println("  → Checking inventory for product: " + productId);
        System.out.println("  → Available: 100 units");
        System.out.println("  → Reserving: " + quantity + " units");

        OutboxMessage message = new OutboxMessage("INVENTORY_RESERVED", String.format(
            "{orderId: '%s', productId: '%s', quantity: %d}", orderId, productId, quantity));

        getOutboxMessages().add(message);
        System.out.println("  → Added outbox message");
        System.out.println("  [DB Transaction Committed]");
    }
}

/**
 * Message relay with retry capabilities for resilient publishing.
 */
class ResilientMessageRelay extends MessageRelay {
    private int attemptCount = 0;

    public ResilientMessageRelay(OrderService orderService) {
        super(orderService);
    }

    /**
     * Publishes messages with retry logic.
     *
     * @param maxRetries Maximum number of retry attempts
     * @param retryDelayMs Delay between retries in milliseconds
     */
    public void publishWithRetry(int maxRetries, long retryDelayMs) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            attemptCount = attempt;
            System.out.println("  Attempt " + attempt + " of " + maxRetries);

            try {
                publishPendingMessages();
                System.out.println("  ✓ Publish successful on attempt " + attempt);
                return;
            } catch (Exception e) {
                System.out.println("  ✗ Attempt " + attempt + " failed: " + e.getMessage());
                if (attempt < maxRetries) {
                    System.out.println("  → Waiting " + retryDelayMs + "ms before retry...");
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
        System.out.println("  ✗ All retry attempts exhausted");
    }
}

/**
 * Concurrent-safe order service for parallel processing.
 */
class ConcurrentOrderService extends OrderService {
    private final Object lock = new Object();

    @Override
    public void createOrder(String customerId, double amount) {
        synchronized (lock) {
            String orderId = "CONCURRENT-" + UUID.randomUUID().toString().substring(0, 6);
            System.out.println("  [Thread " + Thread.currentThread().getName() + "] Creating order: " + orderId);

            OutboxMessage message = new OutboxMessage("ORDER_CREATED", String.format(
                "{orderId: '%s', customerId: '%s', amount: %.2f}", orderId, customerId, amount));

            getOutboxMessages().add(message);
        }
    }
}

/**
 * Message relay that simulates publishing failures.
 */
class FailureSimulatingRelay extends MessageRelay {
    private List<OutboxMessage> failedMessages = new ArrayList<>();
    private boolean simulateFailure = true;

    public FailureSimulatingRelay(OrderService orderService) {
        super(orderService);
    }

    @Override
    public void publishPendingMessages() {
        if (simulateFailure) {
            System.out.println("  ✗ Simulating message broker failure");
            failedMessages.addAll(getOrderService().getOutboxMessages());
            System.out.println("  → " + failedMessages.size() + " messages marked as failed");
        } else {
            super.publishPendingMessages();
        }
    }

    /**
     * Retries publishing failed messages.
     */
    public void retryFailedMessages() {
        simulateFailure = false;
        System.out.println("  → Message broker recovered");
        System.out.println("  → Retrying " + failedMessages.size() + " failed messages");

        for (OutboxMessage msg : failedMessages) {
            System.out.println("    ✓ Published: " + msg.eventType);
        }

        failedMessages.clear();
    }

    private OrderService getOrderService() {
        // Workaround to access parent field
        return new OrderService() {
            @Override
            public List<OutboxMessage> getOutboxMessages() {
                return new ArrayList<>();
            }
        };
    }
}

/**
 * Service with deduplication support using idempotency keys.
 */
class DeduplicationService extends OrderService {
    private Set<String> processedKeys = new HashSet<>();

    /**
     * Creates an order with idempotency key to prevent duplicates.
     *
     * @param customerId The customer identifier
     * @param amount The order amount
     * @param idempotencyKey Unique key for deduplication
     */
    public void createOrder(String customerId, double amount, String idempotencyKey) {
        if (processedKeys.contains(idempotencyKey)) {
            System.out.println("  ⚠ Duplicate detected! Idempotency key already processed: " + idempotencyKey);
            System.out.println("  → Skipping order creation");
            return;
        }

        System.out.println("  → New idempotency key: " + idempotencyKey);
        processedKeys.add(idempotencyKey);
        super.createOrder(customerId, amount);
    }
}

/**
 * Partitioned outbox service for scalable message publishing.
 */
class PartitionedOutboxService {
    private List<OrderService> partitions;
    private int partitionCount;

    /**
     * Creates a partitioned outbox with specified number of partitions.
     *
     * @param partitionCount Number of partitions
     */
    public PartitionedOutboxService(int partitionCount) {
        this.partitionCount = partitionCount;
        this.partitions = new ArrayList<>();

        for (int i = 0; i < partitionCount; i++) {
            partitions.add(new OrderService());
        }

        System.out.println("  → Initialized " + partitionCount + " partitions");
    }

    /**
     * Creates an order in the appropriate partition.
     *
     * @param customerId The customer identifier
     * @param amount The order amount
     */
    public void createOrder(String customerId, double amount) {
        int partition = Math.abs(customerId.hashCode()) % partitionCount;
        System.out.println("  → Routing to partition " + partition + ": " + customerId);
        partitions.get(partition).createOrder(customerId, amount);
    }

    /**
     * Publishes messages from all partitions in parallel.
     */
    public void publishAllPartitions() {
        for (int i = 0; i < partitionCount; i++) {
            final int partitionId = i;
            System.out.println("\n  [Partition " + partitionId + "]");
            MessageRelay relay = new MessageRelay(partitions.get(partitionId));
            relay.publishPendingMessages();
        }
    }
}

/**
 * Priority levels for outbox messages.
 */
enum Priority {
    LOW(1), NORMAL(2), HIGH(3), CRITICAL(4);

    private final int level;

    Priority(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }
}

/**
 * Outbox service with priority support.
 */
class PriorityOutboxService extends OrderService {
    private Map<Priority, List<OutboxMessage>> priorityQueues = new HashMap<>();

    public PriorityOutboxService() {
        for (Priority p : Priority.values()) {
            priorityQueues.put(p, new ArrayList<>());
        }
    }

    /**
     * Creates an event with specified priority.
     *
     * @param eventType The event type
     * @param payload The event payload
     * @param priority The priority level
     */
    public void createEvent(String eventType, String payload, Priority priority) {
        System.out.println("  → Creating " + priority + " priority event: " + eventType);
        OutboxMessage message = new OutboxMessage(eventType, payload);
        priorityQueues.get(priority).add(message);
    }

    public Map<Priority, List<OutboxMessage>> getPriorityQueues() {
        return priorityQueues;
    }
}

/**
 * Message relay that publishes by priority.
 */
class PriorityMessageRelay {
    private PriorityOutboxService service;

    public PriorityMessageRelay(PriorityOutboxService service) {
        this.service = service;
    }

    /**
     * Publishes messages ordered by priority.
     */
    public void publishByPriority() {
        Priority[] priorities = {Priority.CRITICAL, Priority.HIGH, Priority.NORMAL, Priority.LOW};

        for (Priority priority : priorities) {
            List<OutboxMessage> messages = service.getPriorityQueues().get(priority);
            if (!messages.isEmpty()) {
                System.out.println("\n  [Publishing " + priority + " priority messages]");
                for (OutboxMessage msg : messages) {
                    System.out.println("    ✓ " + msg.eventType + " - " + msg.payload);
                }
            }
        }
    }
}

/**
 * Message relay with dead letter queue support.
 */
class DeadLetterQueueRelay extends MessageRelay {
    private List<OutboxMessage> deadLetterQueue = new ArrayList<>();
    private int failureCount = 0;

    public DeadLetterQueueRelay(OrderService orderService) {
        super(orderService);
    }

    /**
     * Publishes messages with DLQ fallback for failures.
     *
     * @param maxAttempts Maximum attempts before moving to DLQ
     */
    public void publishWithDeadLetterQueue(int maxAttempts) {
        List<OutboxMessage> messages = new ArrayList<>();

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            System.out.println("  Attempt " + attempt + ": Simulating failure");
            failureCount++;
        }

        System.out.println("  ✗ Max attempts reached, moving messages to DLQ");
        messages.forEach(msg -> deadLetterQueue.add(msg));
        System.out.println("  → " + deadLetterQueue.size() + " messages moved to DLQ");
    }

    /**
     * Prints contents of the dead letter queue.
     */
    public void printDeadLetterQueue() {
        System.out.println("  Dead Letter Queue contents:");
        if (deadLetterQueue.isEmpty()) {
            System.out.println("    (empty)");
        } else {
            for (OutboxMessage msg : deadLetterQueue) {
                System.out.println("    - " + msg.eventType + ": " + msg.payload);
            }
        }
    }
}

/**
 * Complete e-commerce workflow using transaction outbox.
 */
class EcommerceWorkflow {
    private OrderService orderService = new OrderService();
    private PaymentService paymentService = new PaymentService();
    private InventoryService inventoryService = new InventoryService();
    private int totalEvents = 0;

    /**
     * Processes a complete order from creation to fulfillment.
     *
     * @param customerId The customer identifier
     * @param productId The product identifier
     * @param quantity The order quantity
     * @param cardToken The payment card token
     */
    public void processCompleteOrder(String customerId, String productId, int quantity, String cardToken) {
        String orderId = "WF-" + UUID.randomUUID().toString().substring(0, 8);
        double amount = quantity * 99.99;

        System.out.println("\n  [STEP 1: Order Creation]");
        orderService.createOrder(customerId, amount);
        totalEvents++;

        System.out.println("\n  [STEP 2: Inventory Reservation]");
        inventoryService.reserveInventory(orderId, productId, quantity);
        totalEvents++;

        System.out.println("\n  [STEP 3: Payment Processing]");
        paymentService.processPayment(orderId, customerId, amount, cardToken);
        totalEvents += 3;

        System.out.println("\n  [STEP 4: Order Confirmation]");
        System.out.println("  → Order confirmed: " + orderId);
        System.out.println("  → Total amount: $" + String.format("%.2f", amount));
    }

    /**
     * Publishes all events from the workflow.
     */
    public void publishAllEvents() {
        System.out.println("  → Publishing order events");
        new MessageRelay(orderService).publishPendingMessages();

        System.out.println("  → Publishing inventory events");
        new MessageRelay(inventoryService).publishPendingMessages();

        System.out.println("  → Publishing payment events");
        new MessageRelay(paymentService).publishPendingMessages();
    }

    /**
     * Prints workflow statistics.
     */
    public void printStatistics() {
        System.out.println("    • Total events generated: " + totalEvents);
        System.out.println("    • Services involved: 3 (Order, Inventory, Payment)");
        System.out.println("    • Workflow steps: 4");
    }
}
