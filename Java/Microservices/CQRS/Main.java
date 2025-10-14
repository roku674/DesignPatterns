package Microservices.CQRS;

import java.util.*;
import java.util.concurrent.*;
import java.time.Instant;

/**
 * CQRS (Command Query Responsibility Segregation) Pattern Implementation
 *
 * <p>CQRS separates read and write operations into different models. Commands modify state,
 * while queries read state from optimized read models. This pattern enables independent
 * scaling, optimization, and evolution of read and write sides.</p>
 *
 * <h2>Pattern Benefits:</h2>
 * <ul>
 *   <li>Independent scaling of read and write workloads</li>
 *   <li>Optimized data models for specific query patterns</li>
 *   <li>Improved security through clear separation of concerns</li>
 *   <li>Flexibility to use different databases for read and write</li>
 *   <li>Event sourcing integration</li>
 * </ul>
 *
 * <h2>Implementation Scenarios:</h2>
 * <ol>
 *   <li>Basic Command-Query Separation</li>
 *   <li>Event Sourcing Integration</li>
 *   <li>Multiple Read Models</li>
 *   <li>Async Command Processing</li>
 *   <li>Read Model Synchronization</li>
 *   <li>Command Validation</li>
 *   <li>Eventual Consistency Handling</li>
 *   <li>CQRS with Saga Pattern</li>
 *   <li>Snapshot-based Read Models</li>
 *   <li>Full E-commerce CQRS System</li>
 * </ol>
 *
 * @author Design Patterns Implementation
 * @version 2.0
 * @since 2024-01-01
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║              CQRS PATTERN - MICROSERVICES                      ║");
        System.out.println("║        Command Query Responsibility Segregation                ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        demonstrateBasicCQRS();
        demonstrateEventSourcing();
        demonstrateMultipleReadModels();
        demonstrateAsyncCommands();
        demonstrateReadModelSync();
        demonstrateCommandValidation();
        demonstrateEventualConsistency();
        demonstrateSagaPattern();
        demonstrateSnapshots();
        demonstrateFullSystem();

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           ALL SCENARIOS COMPLETED SUCCESSFULLY                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
    }

    /**
     * Scenario 1: Basic Command-Query Separation
     */
    private static void demonstrateBasicCQRS() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 1: Basic Command-Query Separation");
        System.out.println("=".repeat(70));

        CommandService commandService = new CommandService();
        QueryService queryService = new QueryService();

        System.out.println("\n→ Executing commands (write side)");
        commandService.createProduct("P001", "Laptop", 999.99);
        commandService.updatePrice("P001", 899.99);

        System.out.println("\n→ Executing queries (read side)");
        queryService.getProduct("P001");
        queryService.searchProducts("Laptop");

        System.out.println("\n✓ Scenario 1 completed");
    }

    /**
     * Scenario 2: Event Sourcing Integration
     */
    private static void demonstrateEventSourcing() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2: Event Sourcing Integration");
        System.out.println("=".repeat(70));

        EventStore eventStore = new EventStore();
        EventSourcedCommandService cmdService = new EventSourcedCommandService(eventStore);

        System.out.println("\n→ Creating aggregate with events");
        cmdService.createOrder("O001", "CUST-123", 599.99);
        cmdService.addOrderItem("O001", "PROD-1", 2);
        cmdService.confirmOrder("O001");

        System.out.println("\n→ Rebuilding state from events");
        eventStore.replayEvents("O001");

        System.out.println("\n✓ Scenario 2 completed");
    }

    /**
     * Scenario 3: Multiple Read Models
     */
    private static void demonstrateMultipleReadModels() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3: Multiple Read Models");
        System.out.println("=".repeat(70));

        System.out.println("\n→ Creating specialized read models");
        ProductListView listView = new ProductListView();
        ProductDetailView detailView = new ProductDetailView();
        ProductSearchView searchView = new ProductSearchView();

        System.out.println("\n→ Updating read models from events");
        Event event = new Event("PRODUCT_CREATED", "P100", Map.of("name", "Phone", "price", 799.99));
        listView.handleEvent(event);
        detailView.handleEvent(event);
        searchView.handleEvent(event);

        System.out.println("\n→ Querying different models");
        listView.getList();
        detailView.getDetails("P100");
        searchView.search("Phone");

        System.out.println("\n✓ Scenario 3 completed");
    }

    /**
     * Scenario 4: Async Command Processing
     */
    private static void demonstrateAsyncCommands() throws InterruptedException {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 4: Async Command Processing");
        System.out.println("=".repeat(70));

        AsyncCommandBus commandBus = new AsyncCommandBus();

        System.out.println("\n→ Submitting commands asynchronously");
        commandBus.submit(new CreateOrderCommand("O101", "CUST-1", 299.99));
        commandBus.submit(new CreateOrderCommand("O102", "CUST-2", 399.99));
        commandBus.submit(new CreateOrderCommand("O103", "CUST-3", 499.99));

        System.out.println("\n→ Processing commands in background");
        commandBus.processAll();

        System.out.println("\n✓ Scenario 4 completed");
    }

    /**
     * Scenario 5: Read Model Synchronization
     */
    private static void demonstrateReadModelSync() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 5: Read Model Synchronization");
        System.out.println("=".repeat(70));

        EventStore eventStore = new EventStore();
        ReadModelProjection projection = new ReadModelProjection();

        System.out.println("\n→ Generating events");
        eventStore.append(new Event("USER_CREATED", "U001", Map.of("name", "Alice")));
        eventStore.append(new Event("USER_UPDATED", "U001", Map.of("email", "alice@example.com")));

        System.out.println("\n→ Synchronizing read model");
        projection.syncFromEventStore(eventStore);

        System.out.println("\n→ Verifying read model state");
        projection.verify();

        System.out.println("\n✓ Scenario 5 completed");
    }

    /**
     * Scenario 6: Command Validation
     */
    private static void demonstrateCommandValidation() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 6: Command Validation");
        System.out.println("=".repeat(70));

        ValidatingCommandService cmdService = new ValidatingCommandService();

        System.out.println("\n→ Submitting valid command");
        cmdService.executeCommand(new CreateOrderCommand("O200", "CUST-100", 100.0));

        System.out.println("\n→ Submitting invalid commands");
        cmdService.executeCommand(new CreateOrderCommand("", "CUST-100", 100.0));
        cmdService.executeCommand(new CreateOrderCommand("O201", "CUST-100", -50.0));

        System.out.println("\n✓ Scenario 6 completed");
    }

    /**
     * Scenario 7: Eventual Consistency Handling
     */
    private static void demonstrateEventualConsistency() throws InterruptedException {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 7: Eventual Consistency Handling");
        System.out.println("=".repeat(70));

        EventuallyConsistentSystem system = new EventuallyConsistentSystem();

        System.out.println("\n→ Writing to command side");
        system.writeCommand("UPDATE_INVENTORY", Map.of("productId", "P001", "quantity", "50"));

        System.out.println("\n→ Reading from query side (may be stale)");
        system.queryData("P001");

        System.out.println("\n→ Waiting for synchronization...");
        Thread.sleep(100);

        System.out.println("\n→ Reading again (now consistent)");
        system.queryData("P001");

        System.out.println("\n✓ Scenario 7 completed");
    }

    /**
     * Scenario 8: CQRS with Saga Pattern
     */
    private static void demonstrateSagaPattern() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 8: CQRS with Saga Pattern");
        System.out.println("=".repeat(70));

        OrderSaga saga = new OrderSaga();

        System.out.println("\n→ Starting order saga");
        saga.startOrder("O300", "CUST-500", 1500.0);

        System.out.println("\n→ Processing saga steps");
        saga.reserveInventory();
        saga.processPayment();
        saga.arrangeShipping();

        System.out.println("\n→ Completing saga");
        saga.complete();

        System.out.println("\n✓ Scenario 8 completed");
    }

    /**
     * Scenario 9: Snapshot-based Read Models
     */
    private static void demonstrateSnapshots() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 9: Snapshot-based Read Models");
        System.out.println("=".repeat(70));

        SnapshotStore snapshotStore = new SnapshotStore();
        EventStore eventStore = new EventStore();

        System.out.println("\n→ Building aggregate state");
        for (int i = 1; i <= 100; i++) {
            eventStore.append(new Event("ACCOUNT_DEBITED", "ACC-001", Map.of("amount", 10.0)));
        }

        System.out.println("\n→ Creating snapshot at event 100");
        snapshotStore.saveSnapshot("ACC-001", 100, Map.of("balance", 1000.0));

        System.out.println("\n→ Loading from snapshot (avoiding replay of 100 events)");
        snapshotStore.loadSnapshot("ACC-001");

        System.out.println("\n✓ Scenario 9 completed");
    }

    /**
     * Scenario 10: Full E-commerce CQRS System
     */
    private static void demonstrateFullSystem() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 10: Full E-commerce CQRS System");
        System.out.println("=".repeat(70));

        EcommerceCQRSSystem system = new EcommerceCQRSSystem();

        System.out.println("\n→ Processing complete order workflow");
        system.createOrder("O999", "CUST-999", List.of("P1", "P2"));
        system.processPayment("O999", "CARD-123");
        system.shipOrder("O999");

        System.out.println("\n→ Querying order status");
        system.queryOrderStatus("O999");

        System.out.println("\n→ Generating analytics");
        system.generateAnalytics();

        System.out.println("\n✓ Scenario 10 completed");
    }
}

class EventStore {
    private List<Event> events = new ArrayList<>();
    public void append(Event event) { events.add(event); System.out.println("  [EVENT] Stored: " + event.type); }
    public List<Event> getEvents() { return new ArrayList<>(events); }
    public void replayEvents(String entityId) {
        System.out.println("  [REPLAY] Rebuilding state for " + entityId);
        events.stream().filter(e -> e.entityId.equals(entityId)).forEach(e -> System.out.println("    → " + e.type));
    }
}

class EventSourcedCommandService {
    private EventStore eventStore;
    public EventSourcedCommandService(EventStore eventStore) { this.eventStore = eventStore; }
    public void createOrder(String id, String customerId, double amount) {
        eventStore.append(new Event("ORDER_CREATED", id, Map.of("customerId", customerId, "amount", amount)));
    }
    public void addOrderItem(String orderId, String productId, int quantity) {
        eventStore.append(new Event("ITEM_ADDED", orderId, Map.of("productId", productId, "quantity", quantity)));
    }
    public void confirmOrder(String orderId) {
        eventStore.append(new Event("ORDER_CONFIRMED", orderId, Map.of("status", "CONFIRMED")));
    }
}

class ProductListView {
    private List<String> products = new ArrayList<>();
    public void handleEvent(Event event) { products.add(event.entityId); System.out.println("  [LIST VIEW] Updated"); }
    public void getList() { System.out.println("  [LIST VIEW] Products: " + products.size()); }
}

class ProductDetailView {
    private Map<String, Map<String, Object>> details = new HashMap<>();
    public void handleEvent(Event event) { details.put(event.entityId, event.data); System.out.println("  [DETAIL VIEW] Updated"); }
    public void getDetails(String id) { System.out.println("  [DETAIL VIEW] " + id + ": " + details.get(id)); }
}

class ProductSearchView {
    private Map<String, String> searchIndex = new HashMap<>();
    public void handleEvent(Event event) {
        searchIndex.put(event.entityId, event.data.get("name").toString());
        System.out.println("  [SEARCH VIEW] Indexed");
    }
    public void search(String query) {
        System.out.println("  [SEARCH VIEW] Found: " + searchIndex.values().stream().filter(n -> n.contains(query)).count());
    }
}

class AsyncCommandBus {
    private ExecutorService executor = Executors.newFixedThreadPool(3);
    private List<Command> commands = new ArrayList<>();
    public void submit(Command cmd) { commands.add(cmd); System.out.println("  [ASYNC] Queued: " + cmd.getClass().getSimpleName()); }
    public void processAll() throws InterruptedException {
        for (Command cmd : commands) {
            executor.submit(() -> {
                System.out.println("  [ASYNC] Processing: " + cmd.getClass().getSimpleName());
                cmd.execute();
            });
        }
        executor.shutdown();
        executor.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("  [ASYNC] All commands processed");
    }
}

interface Command { void execute(); }

class CreateOrderCommand implements Command {
    String orderId, customerId;
    double amount;
    public CreateOrderCommand(String orderId, String customerId, double amount) {
        this.orderId = orderId; this.customerId = customerId; this.amount = amount;
    }
    public void execute() { System.out.println("    → Created order: " + orderId); }
}

class ReadModelProjection {
    private Map<String, Object> readModel = new HashMap<>();
    public void syncFromEventStore(EventStore eventStore) {
        List<Event> events = eventStore.getEvents();
        System.out.println("  [PROJECTION] Syncing " + events.size() + " events");
        events.forEach(e -> readModel.put(e.entityId, e.data));
    }
    public void verify() { System.out.println("  [PROJECTION] Read model has " + readModel.size() + " entries"); }
}

class ValidatingCommandService {
    public void executeCommand(Command cmd) {
        if (cmd instanceof CreateOrderCommand) {
            CreateOrderCommand orderCmd = (CreateOrderCommand) cmd;
            if (orderCmd.orderId == null || orderCmd.orderId.isEmpty()) {
                System.out.println("  [VALIDATION] ✗ Failed: Order ID is required");
                return;
            }
            if (orderCmd.amount <= 0) {
                System.out.println("  [VALIDATION] ✗ Failed: Amount must be positive");
                return;
            }
            System.out.println("  [VALIDATION] ✓ Passed");
            cmd.execute();
        }
    }
}

class EventuallyConsistentSystem {
    private Map<String, Object> writeStore = new HashMap<>();
    private Map<String, Object> readStore = new HashMap<>();
    private Timer syncTimer = new Timer();

    public EventuallyConsistentSystem() {
        syncTimer.schedule(new TimerTask() {
            public void run() { readStore.putAll(writeStore); }
        }, 50, 50);
    }

    public void writeCommand(String type, Map<String, Object> data) {
        writeStore.put(data.get("productId").toString(), data);
        System.out.println("  [WRITE] Command executed: " + type);
    }

    public void queryData(String id) {
        Object data = readStore.get(id);
        System.out.println("  [READ] Query result: " + (data != null ? data : "Not yet available"));
    }
}

class OrderSaga {
    private String orderId;
    private List<String> steps = new ArrayList<>();

    public void startOrder(String orderId, String customerId, double amount) {
        this.orderId = orderId;
        steps.add("ORDER_CREATED");
        System.out.println("  [SAGA] Started for order: " + orderId);
    }

    public void reserveInventory() {
        steps.add("INVENTORY_RESERVED");
        System.out.println("  [SAGA] Step: Inventory reserved");
    }

    public void processPayment() {
        steps.add("PAYMENT_PROCESSED");
        System.out.println("  [SAGA] Step: Payment processed");
    }

    public void arrangeShipping() {
        steps.add("SHIPPING_ARRANGED");
        System.out.println("  [SAGA] Step: Shipping arranged");
    }

    public void complete() {
        System.out.println("  [SAGA] Completed with " + steps.size() + " steps");
    }
}

class SnapshotStore {
    private Map<String, Snapshot> snapshots = new HashMap<>();

    public void saveSnapshot(String entityId, long version, Map<String, Object> state) {
        snapshots.put(entityId, new Snapshot(version, state));
        System.out.println("  [SNAPSHOT] Saved at version " + version);
    }

    public void loadSnapshot(String entityId) {
        Snapshot snapshot = snapshots.get(entityId);
        if (snapshot != null) {
            System.out.println("  [SNAPSHOT] Loaded version " + snapshot.version);
            System.out.println("    State: " + snapshot.state);
        }
    }

    static class Snapshot {
        long version;
        Map<String, Object> state;
        Snapshot(long version, Map<String, Object> state) { this.version = version; this.state = state; }
    }
}

class EcommerceCQRSSystem {
    private EventStore eventStore = new EventStore();
    private Map<String, String> orderStatus = new HashMap<>();
    private int totalOrders = 0;

    public void createOrder(String orderId, String customerId, List<String> productIds) {
        eventStore.append(new Event("ORDER_CREATED", orderId, Map.of("customerId", customerId, "products", productIds)));
        orderStatus.put(orderId, "CREATED");
        totalOrders++;
        System.out.println("  [COMMAND] Order created: " + orderId);
    }

    public void processPayment(String orderId, String paymentMethod) {
        eventStore.append(new Event("PAYMENT_PROCESSED", orderId, Map.of("paymentMethod", paymentMethod)));
        orderStatus.put(orderId, "PAID");
        System.out.println("  [COMMAND] Payment processed for: " + orderId);
    }

    public void shipOrder(String orderId) {
        eventStore.append(new Event("ORDER_SHIPPED", orderId, Map.of("shippedAt", Instant.now())));
        orderStatus.put(orderId, "SHIPPED");
        System.out.println("  [COMMAND] Order shipped: " + orderId);
    }

    public void queryOrderStatus(String orderId) {
        String status = orderStatus.get(orderId);
        System.out.println("  [QUERY] Order " + orderId + " status: " + status);
    }

    public void generateAnalytics() {
        System.out.println("  [QUERY] Analytics:");
        System.out.println("    • Total orders: " + totalOrders);
        System.out.println("    • Orders by status: " + orderStatus.size());
        System.out.println("    • Events in store: " + eventStore.getEvents().size());
    }
}
