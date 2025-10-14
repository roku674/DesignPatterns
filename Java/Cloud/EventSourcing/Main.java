package Cloud.EventSourcing;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.time.Instant;
import java.util.stream.Collectors;
import java.util.function.Consumer;

/**
 * EventSourcing Pattern Demonstration
 *
 * This pattern uses an append-only store to record the full series of events
 * that describe actions taken on data. Instead of storing current state, we store
 * the events that led to the current state. It demonstrates:
 * - Event store with append-only semantics
 * - Event replay for state reconstruction
 * - Event versioning and schema evolution
 * - Snapshots for performance optimization
 * - Event projections and read models
 * - Temporal queries (point-in-time state)
 * - Event correlation and causation tracking
 * - CQRS (Command Query Responsibility Segregation)
 *
 * Key Benefits:
 * - Complete audit trail
 * - Temporal queries
 * - Event replay capabilities
 * - Debugging and troubleshooting
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== EventSourcing Pattern Demo ===\n");

        // Scenario 1: Basic Event Sourcing
        demonstrateBasicEventSourcing();

        // Scenario 2: Event Replay and State Reconstruction
        demonstrateEventReplay();

        // Scenario 3: Snapshots for Performance
        demonstrateSnapshots();

        // Scenario 4: Event Versioning
        demonstrateEventVersioning();

        // Scenario 5: Temporal Queries
        demonstrateTemporalQueries();

        // Scenario 6: Event Projections
        demonstrateEventProjections();

        // Scenario 7: CQRS Pattern
        demonstrateCQRS();

        // Scenario 8: Event Correlation and Causation
        demonstrateEventCorrelation();

        // Scenario 9: Async Event Processing
        demonstrateAsyncEventProcessing();

        // Scenario 10: Event Store with Resilience
        demonstrateResilientEventStore();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Demonstrates basic event sourcing with append-only store
     */
    private static void demonstrateBasicEventSourcing() {
        System.out.println("Scenario 1: Basic Event Sourcing");
        System.out.println("--------------------------------");

        EventStore eventStore = new EventStore();
        BankAccount account = new BankAccount("ACC-001", eventStore);

        // Perform operations that generate events
        account.deposit(1000.0);
        account.deposit(500.0);
        account.withdraw(200.0);

        // Display events
        System.out.println("\nStored Events:");
        eventStore.getEvents("ACC-001").forEach(event ->
            System.out.println("  " + event.getType() + ": " + event.getData())
        );

        System.out.println("\nCurrent Balance: $" + account.getBalance());
        System.out.println();
    }

    /**
     * Scenario 2: Demonstrates event replay to reconstruct state
     */
    private static void demonstrateEventReplay() {
        System.out.println("Scenario 2: Event Replay and State Reconstruction");
        System.out.println("-------------------------------------------------");

        EventStore eventStore = new EventStore();

        // Create account and perform operations
        BankAccount account = new BankAccount("ACC-002", eventStore);
        account.deposit(2000.0);
        account.withdraw(500.0);
        account.deposit(300.0);

        System.out.println("Original balance: $" + account.getBalance());

        // Replay events to reconstruct state
        BankAccount reconstructed = new BankAccount("ACC-002", eventStore);
        reconstructed.replayEvents();

        System.out.println("Reconstructed balance: $" + reconstructed.getBalance());
        System.out.println("Events replayed: " + eventStore.getEventCount("ACC-002"));
        System.out.println();
    }

    /**
     * Scenario 3: Demonstrates snapshots for performance optimization
     */
    private static void demonstrateSnapshots() {
        System.out.println("Scenario 3: Snapshots for Performance");
        System.out.println("-------------------------------------");

        SnapshotEventStore snapshotStore = new SnapshotEventStore(5);
        BankAccountWithSnapshot account = new BankAccountWithSnapshot("ACC-003", snapshotStore);

        // Perform many operations
        for (int i = 0; i < 12; i++) {
            account.deposit(100.0);
        }

        System.out.println("Total operations: 12");
        System.out.println("Snapshots created: " + snapshotStore.getSnapshotCount("ACC-003"));
        System.out.println("Final balance: $" + account.getBalance());
        System.out.println();
    }

    /**
     * Scenario 4: Demonstrates event versioning and schema evolution
     */
    private static void demonstrateEventVersioning() {
        System.out.println("Scenario 4: Event Versioning");
        System.out.println("----------------------------");

        VersionedEventStore versionedStore = new VersionedEventStore();

        // Store events with different versions
        versionedStore.appendEvent("ORDER-001", new VersionedEvent("OrderCreated", "v1", "{\"amount\": 100}"));
        versionedStore.appendEvent("ORDER-001", new VersionedEvent("OrderUpdated", "v2", "{\"amount\": 150, \"tax\": 15}"));

        System.out.println("Events with versioning:");
        versionedStore.getEvents("ORDER-001").forEach(event ->
            System.out.println("  " + event.getType() + " (v" + event.getVersion() + "): " + event.getData())
        );
        System.out.println();
    }

    /**
     * Scenario 5: Demonstrates temporal queries (point-in-time state)
     */
    private static void demonstrateTemporalQueries() throws InterruptedException {
        System.out.println("Scenario 5: Temporal Queries");
        System.out.println("----------------------------");

        EventStore eventStore = new EventStore();
        BankAccount account = new BankAccount("ACC-004", eventStore);

        account.deposit(1000.0);
        Thread.sleep(100);
        Instant checkpoint1 = Instant.now();

        Thread.sleep(100);
        account.withdraw(300.0);
        Thread.sleep(100);
        Instant checkpoint2 = Instant.now();

        Thread.sleep(100);
        account.deposit(500.0);

        System.out.println("Balance at checkpoint 1: $" + account.getBalanceAt(checkpoint1));
        System.out.println("Balance at checkpoint 2: $" + account.getBalanceAt(checkpoint2));
        System.out.println("Current balance: $" + account.getBalance());
        System.out.println();
    }

    /**
     * Scenario 6: Demonstrates event projections for read models
     */
    private static void demonstrateEventProjections() {
        System.out.println("Scenario 6: Event Projections");
        System.out.println("-----------------------------");

        EventStore eventStore = new EventStore();
        ProjectionEngine projectionEngine = new ProjectionEngine(eventStore);

        // Create accounts and perform operations
        BankAccount account1 = new BankAccount("ACC-005", eventStore);
        account1.deposit(1000.0);
        account1.withdraw(200.0);

        BankAccount account2 = new BankAccount("ACC-006", eventStore);
        account2.deposit(2000.0);
        account2.withdraw(500.0);

        // Build projections
        projectionEngine.buildAccountSummaryProjection();

        System.out.println("\nAccount Summary Projection:");
        projectionEngine.getAccountSummaries().forEach((accountId, summary) ->
            System.out.println("  " + accountId + ": " + summary)
        );
        System.out.println();
    }

    /**
     * Scenario 7: Demonstrates CQRS pattern with event sourcing
     */
    private static void demonstrateCQRS() {
        System.out.println("Scenario 7: CQRS Pattern");
        System.out.println("------------------------");

        CQRSSystem cqrsSystem = new CQRSSystem();

        // Commands (write side)
        cqrsSystem.executeCommand(new CreateAccountCommand("ACC-007", "John Doe"));
        cqrsSystem.executeCommand(new DepositCommand("ACC-007", 1500.0));
        cqrsSystem.executeCommand(new WithdrawCommand("ACC-007", 300.0));

        // Queries (read side)
        System.out.println("\nQuery Results:");
        AccountReadModel readModel = cqrsSystem.queryAccount("ACC-007");
        if (readModel != null) {
            System.out.println("  Account: " + readModel.getAccountId());
            System.out.println("  Owner: " + readModel.getOwner());
            System.out.println("  Balance: $" + readModel.getBalance());
            System.out.println("  Transaction Count: " + readModel.getTransactionCount());
        }
        System.out.println();
    }

    /**
     * Scenario 8: Demonstrates event correlation and causation tracking
     */
    private static void demonstrateEventCorrelation() {
        System.out.println("Scenario 8: Event Correlation and Causation");
        System.out.println("-------------------------------------------");

        CorrelatedEventStore correlatedStore = new CorrelatedEventStore();

        String correlationId = UUID.randomUUID().toString();

        // Create correlated events
        correlatedStore.appendCorrelatedEvent("TRANSFER-001",
            new CorrelatedEvent("TransferInitiated", "{\"amount\": 500}", correlationId, null));

        String event1Id = correlatedStore.getLastEventId();

        correlatedStore.appendCorrelatedEvent("TRANSFER-001",
            new CorrelatedEvent("DebitAccount", "{\"from\": \"ACC-001\", \"amount\": 500}", correlationId, event1Id));

        String event2Id = correlatedStore.getLastEventId();

        correlatedStore.appendCorrelatedEvent("TRANSFER-001",
            new CorrelatedEvent("CreditAccount", "{\"to\": \"ACC-002\", \"amount\": 500}", correlationId, event2Id));

        System.out.println("Correlated Events:");
        correlatedStore.getEvents("TRANSFER-001").forEach(event ->
            System.out.println("  " + event.getType() + " [correlation: " +
                             event.getCorrelationId().substring(0, 8) + "...]")
        );
        System.out.println();
    }

    /**
     * Scenario 9: Demonstrates async event processing with handlers
     */
    private static void demonstrateAsyncEventProcessing() throws InterruptedException {
        System.out.println("Scenario 9: Async Event Processing");
        System.out.println("----------------------------------");

        AsyncEventStore asyncStore = new AsyncEventStore();

        // Register event handlers
        asyncStore.registerHandler("Deposit", event ->
            System.out.println("  [Handler] Processing deposit: " + event.getData())
        );

        asyncStore.registerHandler("Withdraw", event ->
            System.out.println("  [Handler] Processing withdrawal: " + event.getData())
        );

        // Append events (will be processed async)
        asyncStore.appendEvent("ACC-008", new Event("Deposit", "{\"amount\": 1000}"));
        asyncStore.appendEvent("ACC-008", new Event("Withdraw", "{\"amount\": 200}"));
        asyncStore.appendEvent("ACC-008", new Event("Deposit", "{\"amount\": 500}"));

        Thread.sleep(500); // Wait for async processing
        asyncStore.shutdown();
        System.out.println();
    }

    /**
     * Scenario 10: Demonstrates resilient event store with retry logic
     */
    private static void demonstrateResilientEventStore() {
        System.out.println("Scenario 10: Event Store with Resilience");
        System.out.println("----------------------------------------");

        ResilientEventStore resilientStore = new ResilientEventStore(3);

        // Simulate operations with potential failures
        boolean success1 = resilientStore.appendEventWithRetry("ACC-009",
            new Event("Deposit", "{\"amount\": 1000}"));
        System.out.println("Event 1 appended: " + success1);

        boolean success2 = resilientStore.appendEventWithRetry("ACC-009",
            new Event("Withdraw", "{\"amount\": 200}"));
        System.out.println("Event 2 appended: " + success2);

        System.out.println("Total events stored: " + resilientStore.getEventCount("ACC-009"));
        System.out.println("Retry attempts: " + resilientStore.getTotalRetries());
        System.out.println();
    }
}

/**
 * Represents an immutable event
 */
class Event {
    private final String eventId;
    private final String type;
    private final String data;
    private final Instant timestamp;

    public Event(String type, String data) {
        this.eventId = UUID.randomUUID().toString();
        this.type = type;
        this.data = data;
        this.timestamp = Instant.now();
    }

    public String getEventId() { return eventId; }
    public String getType() { return type; }
    public String getData() { return data; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Versioned event for schema evolution
 */
class VersionedEvent extends Event {
    private final String version;

    public VersionedEvent(String type, String version, String data) {
        super(type, data);
        this.version = version;
    }

    public String getVersion() { return version; }
}

/**
 * Correlated event with causation tracking
 */
class CorrelatedEvent extends Event {
    private final String correlationId;
    private final String causationId;

    public CorrelatedEvent(String type, String data, String correlationId, String causationId) {
        super(type, data);
        this.correlationId = correlationId;
        this.causationId = causationId;
    }

    public String getCorrelationId() { return correlationId; }
    public String getCausationId() { return causationId; }
}

/**
 * Append-only event store
 */
class EventStore {
    private final Map<String, List<Event>> eventStreams;

    public EventStore() {
        this.eventStreams = new ConcurrentHashMap<>();
    }

    public void appendEvent(String aggregateId, Event event) {
        eventStreams.computeIfAbsent(aggregateId, k ->
            Collections.synchronizedList(new ArrayList<>())
        ).add(event);
    }

    public List<Event> getEvents(String aggregateId) {
        return new ArrayList<>(eventStreams.getOrDefault(aggregateId, Collections.emptyList()));
    }

    public List<Event> getEventsUpTo(String aggregateId, Instant timestamp) {
        return getEvents(aggregateId).stream()
            .filter(event -> event.getTimestamp().isBefore(timestamp) ||
                           event.getTimestamp().equals(timestamp))
            .collect(Collectors.toList());
    }

    public int getEventCount(String aggregateId) {
        return eventStreams.getOrDefault(aggregateId, Collections.emptyList()).size();
    }
}

/**
 * Event store with snapshot support
 */
class SnapshotEventStore extends EventStore {
    private final Map<String, List<Snapshot>> snapshots;
    private final int snapshotInterval;

    public SnapshotEventStore(int snapshotInterval) {
        super();
        this.snapshots = new ConcurrentHashMap<>();
        this.snapshotInterval = snapshotInterval;
    }

    @Override
    public void appendEvent(String aggregateId, Event event) {
        super.appendEvent(aggregateId, event);

        // Create snapshot if interval reached
        int eventCount = getEventCount(aggregateId);
        if (eventCount % snapshotInterval == 0) {
            createSnapshot(aggregateId, eventCount);
        }
    }

    private void createSnapshot(String aggregateId, int version) {
        snapshots.computeIfAbsent(aggregateId, k ->
            Collections.synchronizedList(new ArrayList<>())
        ).add(new Snapshot(version, Instant.now()));
    }

    public int getSnapshotCount(String aggregateId) {
        return snapshots.getOrDefault(aggregateId, Collections.emptyList()).size();
    }
}

/**
 * Represents a state snapshot
 */
class Snapshot {
    private final int version;
    private final Instant timestamp;

    public Snapshot(int version, Instant timestamp) {
        this.version = version;
        this.timestamp = timestamp;
    }

    public int getVersion() { return version; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Event store with versioning
 */
class VersionedEventStore {
    private final Map<String, List<VersionedEvent>> eventStreams;

    public VersionedEventStore() {
        this.eventStreams = new ConcurrentHashMap<>();
    }

    public void appendEvent(String aggregateId, VersionedEvent event) {
        eventStreams.computeIfAbsent(aggregateId, k ->
            Collections.synchronizedList(new ArrayList<>())
        ).add(event);
    }

    public List<VersionedEvent> getEvents(String aggregateId) {
        return new ArrayList<>(eventStreams.getOrDefault(aggregateId, Collections.emptyList()));
    }
}

/**
 * Bank account aggregate using event sourcing
 */
class BankAccount {
    private final String accountId;
    private final EventStore eventStore;
    private double balance;

    public BankAccount(String accountId, EventStore eventStore) {
        this.accountId = accountId;
        this.eventStore = eventStore;
        this.balance = 0.0;
    }

    public void deposit(double amount) {
        Event event = new Event("Deposit", "{\"amount\": " + amount + "}");
        eventStore.appendEvent(accountId, event);
        applyEvent(event);
        System.out.println("Deposited: $" + amount);
    }

    public void withdraw(double amount) {
        if (balance >= amount) {
            Event event = new Event("Withdraw", "{\"amount\": " + amount + "}");
            eventStore.appendEvent(accountId, event);
            applyEvent(event);
            System.out.println("Withdrew: $" + amount);
        } else {
            System.out.println("Insufficient funds");
        }
    }

    public void replayEvents() {
        balance = 0.0;
        List<Event> events = eventStore.getEvents(accountId);
        events.forEach(this::applyEvent);
    }

    private void applyEvent(Event event) {
        switch (event.getType()) {
            case "Deposit":
                String depositData = event.getData();
                double depositAmount = extractAmount(depositData);
                balance += depositAmount;
                break;
            case "Withdraw":
                String withdrawData = event.getData();
                double withdrawAmount = extractAmount(withdrawData);
                balance -= withdrawAmount;
                break;
        }
    }

    private double extractAmount(String data) {
        // Simplified JSON parsing
        String amountStr = data.split("\"amount\": ")[1].split("}")[0];
        return Double.parseDouble(amountStr);
    }

    public double getBalance() {
        return balance;
    }

    public double getBalanceAt(Instant timestamp) {
        double tempBalance = 0.0;
        List<Event> events = eventStore.getEventsUpTo(accountId, timestamp);
        for (Event event : events) {
            if (event.getType().equals("Deposit")) {
                tempBalance += extractAmount(event.getData());
            } else if (event.getType().equals("Withdraw")) {
                tempBalance -= extractAmount(event.getData());
            }
        }
        return tempBalance;
    }
}

/**
 * Bank account with snapshot support
 */
class BankAccountWithSnapshot extends BankAccount {
    public BankAccountWithSnapshot(String accountId, SnapshotEventStore eventStore) {
        super(accountId, eventStore);
    }
}

/**
 * Projection engine for read models
 */
class ProjectionEngine {
    private final EventStore eventStore;
    private final Map<String, String> accountSummaries;

    public ProjectionEngine(EventStore eventStore) {
        this.eventStore = eventStore;
        this.accountSummaries = new ConcurrentHashMap<>();
    }

    public void buildAccountSummaryProjection() {
        // This would normally iterate over all aggregates
        // Simplified for demonstration
    }

    public void projectAccount(String accountId) {
        List<Event> events = eventStore.getEvents(accountId);
        int transactionCount = events.size();
        accountSummaries.put(accountId, transactionCount + " transactions");
    }

    public Map<String, String> getAccountSummaries() {
        return new HashMap<>(accountSummaries);
    }
}

/**
 * Command interface for CQRS
 */
interface Command {
    String getAggregateId();
}

class CreateAccountCommand implements Command {
    private final String accountId;
    private final String owner;

    public CreateAccountCommand(String accountId, String owner) {
        this.accountId = accountId;
        this.owner = owner;
    }

    public String getAggregateId() { return accountId; }
    public String getOwner() { return owner; }
}

class DepositCommand implements Command {
    private final String accountId;
    private final double amount;

    public DepositCommand(String accountId, double amount) {
        this.accountId = accountId;
        this.amount = amount;
    }

    public String getAggregateId() { return accountId; }
    public double getAmount() { return amount; }
}

class WithdrawCommand implements Command {
    private final String accountId;
    private final double amount;

    public WithdrawCommand(String accountId, double amount) {
        this.accountId = accountId;
        this.amount = amount;
    }

    public String getAggregateId() { return accountId; }
    public double getAmount() { return amount; }
}

/**
 * Read model for queries
 */
class AccountReadModel {
    private final String accountId;
    private final String owner;
    private double balance;
    private int transactionCount;

    public AccountReadModel(String accountId, String owner) {
        this.accountId = accountId;
        this.owner = owner;
        this.balance = 0.0;
        this.transactionCount = 0;
    }

    public void applyEvent(Event event) {
        transactionCount++;
        if (event.getType().equals("Deposit")) {
            balance += extractAmount(event.getData());
        } else if (event.getType().equals("Withdraw")) {
            balance -= extractAmount(event.getData());
        }
    }

    private double extractAmount(String data) {
        String amountStr = data.split("\"amount\": ")[1].split("}")[0];
        return Double.parseDouble(amountStr);
    }

    public String getAccountId() { return accountId; }
    public String getOwner() { return owner; }
    public double getBalance() { return balance; }
    public int getTransactionCount() { return transactionCount; }
}

/**
 * CQRS system combining commands and queries
 */
class CQRSSystem {
    private final EventStore eventStore;
    private final Map<String, AccountReadModel> readModels;

    public CQRSSystem() {
        this.eventStore = new EventStore();
        this.readModels = new ConcurrentHashMap<>();
    }

    public void executeCommand(Command command) {
        if (command instanceof CreateAccountCommand) {
            CreateAccountCommand cmd = (CreateAccountCommand) command;
            Event event = new Event("AccountCreated",
                "{\"owner\": \"" + cmd.getOwner() + "\"}");
            eventStore.appendEvent(cmd.getAggregateId(), event);

            AccountReadModel readModel = new AccountReadModel(cmd.getAggregateId(), cmd.getOwner());
            readModels.put(cmd.getAggregateId(), readModel);

            System.out.println("Command executed: CreateAccount");

        } else if (command instanceof DepositCommand) {
            DepositCommand cmd = (DepositCommand) command;
            Event event = new Event("Deposit", "{\"amount\": " + cmd.getAmount() + "}");
            eventStore.appendEvent(cmd.getAggregateId(), event);

            AccountReadModel readModel = readModels.get(cmd.getAggregateId());
            if (readModel != null) {
                readModel.applyEvent(event);
            }

            System.out.println("Command executed: Deposit");

        } else if (command instanceof WithdrawCommand) {
            WithdrawCommand cmd = (WithdrawCommand) command;
            Event event = new Event("Withdraw", "{\"amount\": " + cmd.getAmount() + "}");
            eventStore.appendEvent(cmd.getAggregateId(), event);

            AccountReadModel readModel = readModels.get(cmd.getAggregateId());
            if (readModel != null) {
                readModel.applyEvent(event);
            }

            System.out.println("Command executed: Withdraw");
        }
    }

    public AccountReadModel queryAccount(String accountId) {
        return readModels.get(accountId);
    }
}

/**
 * Event store with correlation tracking
 */
class CorrelatedEventStore {
    private final Map<String, List<CorrelatedEvent>> eventStreams;
    private String lastEventId;

    public CorrelatedEventStore() {
        this.eventStreams = new ConcurrentHashMap<>();
    }

    public void appendCorrelatedEvent(String aggregateId, CorrelatedEvent event) {
        eventStreams.computeIfAbsent(aggregateId, k ->
            Collections.synchronizedList(new ArrayList<>())
        ).add(event);
        lastEventId = event.getEventId();
    }

    public List<CorrelatedEvent> getEvents(String aggregateId) {
        return new ArrayList<>(eventStreams.getOrDefault(aggregateId, Collections.emptyList()));
    }

    public String getLastEventId() {
        return lastEventId;
    }
}

/**
 * Async event store with handler support
 */
class AsyncEventStore {
    private final EventStore eventStore;
    private final Map<String, Consumer<Event>> eventHandlers;
    private final ExecutorService executorService;

    public AsyncEventStore() {
        this.eventStore = new EventStore();
        this.eventHandlers = new ConcurrentHashMap<>();
        this.executorService = Executors.newFixedThreadPool(4);
    }

    public void registerHandler(String eventType, Consumer<Event> handler) {
        eventHandlers.put(eventType, handler);
    }

    public void appendEvent(String aggregateId, Event event) {
        eventStore.appendEvent(aggregateId, event);

        // Process event asynchronously
        executorService.submit(() -> {
            Consumer<Event> handler = eventHandlers.get(event.getType());
            if (handler != null) {
                handler.accept(event);
            }
        });
    }

    public void shutdown() {
        executorService.shutdown();
    }
}

/**
 * Resilient event store with retry logic
 */
class ResilientEventStore {
    private final EventStore eventStore;
    private final int maxRetries;
    private final AtomicInteger totalRetries;
    private final Random random;

    public ResilientEventStore(int maxRetries) {
        this.eventStore = new EventStore();
        this.maxRetries = maxRetries;
        this.totalRetries = new AtomicInteger(0);
        this.random = new Random();
    }

    public boolean appendEventWithRetry(String aggregateId, Event event) {
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                // Simulate potential failure
                if (random.nextDouble() < 0.3 && attempt < maxRetries - 1) {
                    throw new RuntimeException("Simulated transient failure");
                }

                eventStore.appendEvent(aggregateId, event);
                return true;
            } catch (Exception e) {
                attempt++;
                totalRetries.incrementAndGet();
                System.out.println("Retry attempt " + attempt + " for event: " + event.getType());

                try {
                    Thread.sleep(100 * attempt); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        return false;
    }

    public int getEventCount(String aggregateId) {
        return eventStore.getEventCount(aggregateId);
    }

    public int getTotalRetries() {
        return totalRetries.get();
    }
}
