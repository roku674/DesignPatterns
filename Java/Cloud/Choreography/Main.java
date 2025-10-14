package Cloud.Choreography;

import java.util.*;
import java.util.concurrent.*;
import java.time.Instant;
import java.time.Duration;

/**
 * Choreography Pattern Demonstration
 *
 * The Choreography pattern enables each service to decide when and how to react
 * to domain events without a central coordinator. Services publish events and
 * subscribe to events from other services, creating a decentralized workflow.
 *
 * Key Components:
 * - Event Bus: Central messaging infrastructure
 * - Services: Independent services that publish and subscribe to events
 * - Events: Domain events that represent state changes
 *
 * Cloud Resilience Features:
 * - Asynchronous event processing
 * - Event retry with dead letter queue
 * - Event idempotency handling
 * - Service health monitoring
 * - Compensating actions on failures
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Choreography Pattern Demo ===\n");

        // Scenario 1: Basic event choreography
        demonstrateBasicChoreography();

        // Scenario 2: E-commerce order workflow
        demonstrateOrderWorkflow();

        // Scenario 3: Event retry and dead letter queue
        demonstrateEventRetry();

        // Scenario 4: Idempotent event processing
        demonstrateIdempotency();

        // Scenario 5: Async event propagation
        demonstrateAsyncEventPropagation();

        // Scenario 6: Service failure and compensation
        demonstrateServiceFailureCompensation();

        // Scenario 7: Event filtering and routing
        demonstrateEventFiltering();

        // Scenario 8: Saga pattern with choreography
        demonstrateSagaChoreography();

        // Scenario 9: Event versioning and schema evolution
        demonstrateEventVersioning();

        // Scenario 10: Monitoring and observability
        demonstrateMonitoring();

        System.out.println("\nPattern demonstration complete.");
    }

    /**
     * Scenario 1: Basic event choreography between services
     * Demonstrates fundamental event-driven communication
     */
    private static void demonstrateBasicChoreography() {
        System.out.println("--- Scenario 1: Basic Event Choreography ---");

        EventBus eventBus = new EventBus();

        // Create services
        OrderService orderService = new OrderService(eventBus);
        InventoryService inventoryService = new InventoryService(eventBus);
        NotificationService notificationService = new NotificationService(eventBus);

        // Subscribe services to events
        eventBus.subscribe("OrderCreated", inventoryService);
        eventBus.subscribe("InventoryReserved", notificationService);

        // Trigger workflow
        orderService.createOrder("ORDER-001", "PRODUCT-123", 2);

        System.out.println();
    }

    /**
     * Scenario 2: Complete e-commerce order workflow
     * Demonstrates multi-service choreography
     */
    private static void demonstrateOrderWorkflow() {
        System.out.println("--- Scenario 2: E-commerce Order Workflow ---");

        EventBus eventBus = new EventBus();

        // Create all services
        OrderService orderService = new OrderService(eventBus);
        InventoryService inventoryService = new InventoryService(eventBus);
        PaymentService paymentService = new PaymentService(eventBus);
        ShippingService shippingService = new ShippingService(eventBus);
        NotificationService notificationService = new NotificationService(eventBus);

        // Wire up choreography
        eventBus.subscribe("OrderCreated", inventoryService);
        eventBus.subscribe("InventoryReserved", paymentService);
        eventBus.subscribe("PaymentProcessed", shippingService);
        eventBus.subscribe("OrderShipped", notificationService);

        // Execute workflow
        orderService.createOrder("ORDER-002", "PRODUCT-456", 1);

        System.out.println();
    }

    /**
     * Scenario 3: Event retry mechanism and dead letter queue
     * Demonstrates resilience for failed event processing
     */
    private static void demonstrateEventRetry() throws Exception {
        System.out.println("--- Scenario 3: Event Retry and Dead Letter Queue ---");

        EventBus eventBus = new EventBus();
        eventBus.enableRetry(3, Duration.ofMillis(100));

        FlakyService flakyService = new FlakyService(eventBus, 2); // Fail 2 times
        eventBus.subscribe("TestEvent", flakyService);

        // Publish event that will require retries
        Event event = new Event("TestEvent", Map.of("data", "test"));
        eventBus.publish(event);

        Thread.sleep(500); // Wait for retries
        eventBus.displayDeadLetterQueue();

        System.out.println();
    }

    /**
     * Scenario 4: Idempotent event processing
     * Demonstrates handling duplicate events safely
     */
    private static void demonstrateIdempotency() {
        System.out.println("--- Scenario 4: Idempotent Event Processing ---");

        EventBus eventBus = new EventBus();
        IdempotentService idempotentService = new IdempotentService(eventBus);

        eventBus.subscribe("PaymentEvent", idempotentService);

        // Publish same event multiple times
        Event event = new Event("PaymentEvent",
            Map.of("orderId", "ORDER-003", "amount", 100.0));

        eventBus.publish(event);
        eventBus.publish(event); // Duplicate
        eventBus.publish(event); // Duplicate

        System.out.println();
    }

    /**
     * Scenario 5: Asynchronous event propagation
     * Demonstrates non-blocking event processing
     */
    private static void demonstrateAsyncEventPropagation() throws Exception {
        System.out.println("--- Scenario 5: Async Event Propagation ---");

        EventBus eventBus = new EventBus();
        eventBus.enableAsyncProcessing();

        AsyncService asyncService = new AsyncService(eventBus);
        eventBus.subscribe("AsyncEvent", asyncService);

        // Publish multiple events
        for (int i = 0; i < 5; i++) {
            Event event = new Event("AsyncEvent", Map.of("id", i));
            eventBus.publish(event);
        }

        System.out.println("All events published, processing in background...");
        Thread.sleep(1000);

        System.out.println();
    }

    /**
     * Scenario 6: Service failure and compensating actions
     * Demonstrates handling failures in choreography
     */
    private static void demonstrateServiceFailureCompensation() {
        System.out.println("--- Scenario 6: Service Failure and Compensation ---");

        EventBus eventBus = new EventBus();

        OrderService orderService = new OrderService(eventBus);
        InventoryService inventoryService = new InventoryService(eventBus);
        PaymentService paymentService = new PaymentService(eventBus);
        paymentService.simulateFailure(true);

        // Subscribe with compensation
        eventBus.subscribe("OrderCreated", inventoryService);
        eventBus.subscribe("InventoryReserved", paymentService);
        eventBus.subscribe("PaymentFailed", inventoryService); // Compensate

        orderService.createOrder("ORDER-004", "PRODUCT-789", 1);

        System.out.println();
    }

    /**
     * Scenario 7: Event filtering and content-based routing
     * Demonstrates selective event subscription
     */
    private static void demonstrateEventFiltering() {
        System.out.println("--- Scenario 7: Event Filtering and Routing ---");

        EventBus eventBus = new EventBus();
        PriorityService priorityService = new PriorityService(eventBus);

        eventBus.subscribe("OrderCreated", priorityService,
            event -> {
                Object priority = event.getData().get("priority");
                return "HIGH".equals(priority);
            });

        // Publish events with different priorities
        eventBus.publish(new Event("OrderCreated",
            Map.of("orderId", "ORDER-005", "priority", "LOW")));
        eventBus.publish(new Event("OrderCreated",
            Map.of("orderId", "ORDER-006", "priority", "HIGH")));

        System.out.println();
    }

    /**
     * Scenario 8: Saga pattern implemented with choreography
     * Demonstrates distributed transaction coordination
     */
    private static void demonstrateSagaChoreography() {
        System.out.println("--- Scenario 8: Saga Pattern with Choreography ---");

        EventBus eventBus = new EventBus();

        SagaOrderService sagaOrder = new SagaOrderService(eventBus);
        SagaInventoryService sagaInventory = new SagaInventoryService(eventBus);
        SagaPaymentService sagaPayment = new SagaPaymentService(eventBus);

        // Wire up saga choreography
        eventBus.subscribe("SagaOrderCreated", sagaInventory);
        eventBus.subscribe("SagaInventoryReserved", sagaPayment);
        eventBus.subscribe("SagaPaymentFailed", sagaInventory); // Rollback

        sagaOrder.startSaga("SAGA-001", "PRODUCT-999", 1);

        System.out.println();
    }

    /**
     * Scenario 9: Event versioning and schema evolution
     * Demonstrates backward compatibility in events
     */
    private static void demonstrateEventVersioning() {
        System.out.println("--- Scenario 9: Event Versioning ---");

        EventBus eventBus = new EventBus();
        VersionedService versionedService = new VersionedService(eventBus);

        eventBus.subscribe("OrderEvent", versionedService);

        // Publish v1 event
        Event eventV1 = new Event("OrderEvent",
            Map.of("version", "1.0", "orderId", "ORDER-007"));
        eventBus.publish(eventV1);

        // Publish v2 event with additional fields
        Event eventV2 = new Event("OrderEvent",
            Map.of("version", "2.0", "orderId", "ORDER-008", "customerId", "CUST-123"));
        eventBus.publish(eventV2);

        System.out.println();
    }

    /**
     * Scenario 10: Monitoring and observability
     * Demonstrates event tracking and metrics
     */
    private static void demonstrateMonitoring() {
        System.out.println("--- Scenario 10: Monitoring and Observability ---");

        EventBus eventBus = new EventBus();
        eventBus.enableMonitoring();

        MonitoredService monitoredService = new MonitoredService(eventBus);
        eventBus.subscribe("MonitoredEvent", monitoredService);

        // Generate events
        for (int i = 0; i < 5; i++) {
            eventBus.publish(new Event("MonitoredEvent", Map.of("id", i)));
        }

        eventBus.displayMetrics();

        System.out.println();
    }
}

/**
 * Event class representing a domain event
 */
class Event {
    private String type;
    private Map<String, Object> data;
    private String id;
    private Instant timestamp;
    private int retryCount;

    public Event(String type, Map<String, Object> data) {
        this.type = type;
        this.data = new HashMap<>(data);
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now();
        this.retryCount = 0;
    }

    public String getType() { return type; }
    public Map<String, Object> getData() { return data; }
    public String getId() { return id; }
    public Instant getTimestamp() { return timestamp; }
    public int getRetryCount() { return retryCount; }
    public void incrementRetry() { retryCount++; }
}

/**
 * Event filter interface for content-based routing
 */
interface EventFilter {
    boolean accept(Event event);
}

/**
 * Event subscriber interface
 */
interface EventSubscriber {
    void onEvent(Event event);
}

/**
 * Event bus for pub/sub communication
 */
class EventBus {
    private Map<String, List<SubscriberInfo>> subscribers = new ConcurrentHashMap<>();
    private List<Event> deadLetterQueue = new CopyOnWriteArrayList<>();
    private ExecutorService executor = Executors.newFixedThreadPool(10);

    private boolean retryEnabled = false;
    private int maxRetries = 3;
    private Duration retryDelay = Duration.ofMillis(100);
    private boolean asyncEnabled = false;
    private boolean monitoringEnabled = false;

    private int totalEvents = 0;
    private int successfulEvents = 0;
    private int failedEvents = 0;

    public void subscribe(String eventType, EventSubscriber subscriber) {
        subscribe(eventType, subscriber, null);
    }

    public void subscribe(String eventType, EventSubscriber subscriber, EventFilter filter) {
        subscribers.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>())
            .add(new SubscriberInfo(subscriber, filter));
        System.out.println("  [SUBSCRIBED] " + subscriber.getClass().getSimpleName() + " to " + eventType);
    }

    public void publish(Event event) {
        if (monitoringEnabled) {
            totalEvents++;
        }

        System.out.println("  [PUBLISHED] " + event.getType() + " (id: " + event.getId().substring(0, 8) + ")");

        List<SubscriberInfo> subs = subscribers.get(event.getType());
        if (subs != null) {
            for (SubscriberInfo info : subs) {
                if (info.filter == null || info.filter.accept(event)) {
                    if (asyncEnabled) {
                        executor.submit(() -> deliverEvent(event, info.subscriber));
                    } else {
                        deliverEvent(event, info.subscriber);
                    }
                }
            }
        }
    }

    private void deliverEvent(Event event, EventSubscriber subscriber) {
        try {
            subscriber.onEvent(event);
            if (monitoringEnabled) {
                successfulEvents++;
            }
        } catch (Exception e) {
            if (monitoringEnabled) {
                failedEvents++;
            }

            if (retryEnabled && event.getRetryCount() < maxRetries) {
                event.incrementRetry();
                System.out.println("  [RETRY] Attempt " + event.getRetryCount() + " for event " +
                    event.getId().substring(0, 8));

                try {
                    Thread.sleep(retryDelay.toMillis());
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }

                deliverEvent(event, subscriber);
            } else {
                System.out.println("  [FAILED] Event " + event.getId().substring(0, 8) +
                    " moved to dead letter queue");
                deadLetterQueue.add(event);
            }
        }
    }

    public void enableRetry(int maxRetries, Duration retryDelay) {
        this.retryEnabled = true;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }

    public void enableAsyncProcessing() {
        this.asyncEnabled = true;
    }

    public void enableMonitoring() {
        this.monitoringEnabled = true;
    }

    public void displayDeadLetterQueue() {
        System.out.println("  Dead Letter Queue: " + deadLetterQueue.size() + " events");
    }

    public void displayMetrics() {
        System.out.println("  Event Metrics:");
        System.out.println("    Total Events: " + totalEvents);
        System.out.println("    Successful: " + successfulEvents);
        System.out.println("    Failed: " + failedEvents);
    }

    public void shutdown() {
        executor.shutdown();
    }

    private static class SubscriberInfo {
        EventSubscriber subscriber;
        EventFilter filter;

        SubscriberInfo(EventSubscriber subscriber, EventFilter filter) {
            this.subscriber = subscriber;
            this.filter = filter;
        }
    }
}

/**
 * Order service
 */
class OrderService implements EventSubscriber {
    private EventBus eventBus;

    public OrderService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    public void createOrder(String orderId, String productId, int quantity) {
        System.out.println("  [ORDER] Created order: " + orderId);

        Map<String, Object> data = new HashMap<>();
        data.put("orderId", orderId);
        data.put("productId", productId);
        data.put("quantity", quantity);

        eventBus.publish(new Event("OrderCreated", data));
    }

    @Override
    public void onEvent(Event event) {
        System.out.println("  [ORDER] Received event: " + event.getType());
    }
}

/**
 * Inventory service
 */
class InventoryService implements EventSubscriber {
    private EventBus eventBus;

    public InventoryService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        if ("OrderCreated".equals(event.getType())) {
            String orderId = (String) event.getData().get("orderId");
            System.out.println("  [INVENTORY] Reserving inventory for order: " + orderId);

            Map<String, Object> data = new HashMap<>(event.getData());
            eventBus.publish(new Event("InventoryReserved", data));
        } else if ("PaymentFailed".equals(event.getType())) {
            String orderId = (String) event.getData().get("orderId");
            System.out.println("  [INVENTORY] Releasing inventory for order: " + orderId + " (compensation)");
        }
    }
}

/**
 * Payment service
 */
class PaymentService implements EventSubscriber {
    private EventBus eventBus;
    private boolean simulateFailure = false;

    public PaymentService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    public void simulateFailure(boolean fail) {
        this.simulateFailure = fail;
    }

    @Override
    public void onEvent(Event event) {
        String orderId = (String) event.getData().get("orderId");

        if (simulateFailure) {
            System.out.println("  [PAYMENT] Payment failed for order: " + orderId);
            eventBus.publish(new Event("PaymentFailed", event.getData()));
        } else {
            System.out.println("  [PAYMENT] Processing payment for order: " + orderId);
            eventBus.publish(new Event("PaymentProcessed", event.getData()));
        }
    }
}

/**
 * Shipping service
 */
class ShippingService implements EventSubscriber {
    private EventBus eventBus;

    public ShippingService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        String orderId = (String) event.getData().get("orderId");
        System.out.println("  [SHIPPING] Shipping order: " + orderId);
        eventBus.publish(new Event("OrderShipped", event.getData()));
    }
}

/**
 * Notification service
 */
class NotificationService implements EventSubscriber {
    private EventBus eventBus;

    public NotificationService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        String orderId = (String) event.getData().get("orderId");
        System.out.println("  [NOTIFICATION] Sending notification for order: " + orderId);
    }
}

/**
 * Flaky service for testing retries
 */
class FlakyService implements EventSubscriber {
    private EventBus eventBus;
    private int failuresRemaining;

    public FlakyService(EventBus eventBus, int failures) {
        this.eventBus = eventBus;
        this.failuresRemaining = failures;
    }

    @Override
    public void onEvent(Event event) {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new RuntimeException("Service temporarily unavailable");
        }
        System.out.println("  [FLAKY] Successfully processed event");
    }
}

/**
 * Idempotent service
 */
class IdempotentService implements EventSubscriber {
    private Set<String> processedEvents = ConcurrentHashMap.newKeySet();
    private EventBus eventBus;

    public IdempotentService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        if (processedEvents.contains(event.getId())) {
            System.out.println("  [IDEMPOTENT] Skipping duplicate event: " + event.getId().substring(0, 8));
            return;
        }

        processedEvents.add(event.getId());
        System.out.println("  [IDEMPOTENT] Processing event: " + event.getId().substring(0, 8));
    }
}

/**
 * Async service
 */
class AsyncService implements EventSubscriber {
    private EventBus eventBus;

    public AsyncService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        System.out.println("  [ASYNC] Processing event: " + event.getData().get("id"));
        try {
            Thread.sleep(200); // Simulate processing
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

/**
 * Priority service with filtering
 */
class PriorityService implements EventSubscriber {
    private EventBus eventBus;

    public PriorityService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        System.out.println("  [PRIORITY] Processing high priority order: " +
            event.getData().get("orderId"));
    }
}

/**
 * Saga services
 */
class SagaOrderService implements EventSubscriber {
    private EventBus eventBus;

    public SagaOrderService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    public void startSaga(String sagaId, String productId, int quantity) {
        System.out.println("  [SAGA-ORDER] Starting saga: " + sagaId);
        eventBus.publish(new Event("SagaOrderCreated",
            Map.of("sagaId", sagaId, "productId", productId, "quantity", quantity)));
    }

    @Override
    public void onEvent(Event event) {}
}

class SagaInventoryService implements EventSubscriber {
    private EventBus eventBus;

    public SagaInventoryService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        if ("SagaOrderCreated".equals(event.getType())) {
            System.out.println("  [SAGA-INVENTORY] Reserving inventory");
            eventBus.publish(new Event("SagaInventoryReserved", event.getData()));
        } else if ("SagaPaymentFailed".equals(event.getType())) {
            System.out.println("  [SAGA-INVENTORY] Rolling back inventory reservation");
        }
    }
}

class SagaPaymentService implements EventSubscriber {
    private EventBus eventBus;

    public SagaPaymentService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        System.out.println("  [SAGA-PAYMENT] Processing payment (simulating failure)");
        eventBus.publish(new Event("SagaPaymentFailed", event.getData()));
    }
}

/**
 * Versioned service
 */
class VersionedService implements EventSubscriber {
    private EventBus eventBus;

    public VersionedService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        String version = (String) event.getData().get("version");
        System.out.println("  [VERSIONED] Processing event version: " + version);

        if ("2.0".equals(version)) {
            System.out.println("  [VERSIONED] Found customer ID: " + event.getData().get("customerId"));
        }
    }
}

/**
 * Monitored service
 */
class MonitoredService implements EventSubscriber {
    private EventBus eventBus;

    public MonitoredService(EventBus eventBus) {
        this.eventBus = eventBus;
    }

    @Override
    public void onEvent(Event event) {
        System.out.println("  [MONITORED] Processing event: " + event.getData().get("id"));
    }
}
