package Microservices.Saga;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;
import java.util.function.Consumer;

/**
 * Saga Pattern Demonstration
 *
 * Maintains data consistency across services using sequence of local transactions.
 * The Saga pattern coordinates distributed transactions by breaking them into a sequence
 * of local transactions. Each local transaction updates the database and publishes an
 * event or message to trigger the next step. If a step fails, the saga executes
 * compensating transactions to undo the changes.
 *
 * Key Components:
 * - Saga Orchestrator: Coordinates the execution of saga steps
 * - Saga Steps: Individual transactions that can be executed and compensated
 * - Compensation Logic: Rollback mechanism for failed transactions
 * - Event Bus: Communication mechanism between services
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Saga Pattern Demo ===\n");

        // Scenario 1: Basic Saga execution
        demonstrateBasicSaga();

        // Scenario 2: Saga with compensation
        demonstrateSagaWithCompensation();

        // Scenario 3: Choreography-based Saga
        demonstrateChoreographySaga();

        // Scenario 4: Orchestration-based Saga
        demonstrateOrchestrationSaga();

        // Scenario 5: Order processing Saga
        demonstrateOrderProcessingSaga();

        // Scenario 6: Payment Saga with rollback
        demonstratePaymentSaga();

        // Scenario 7: Multi-service booking Saga
        demonstrateBookingSaga();

        // Scenario 8: Failed Saga recovery
        demonstrateFailedSagaRecovery();

        // Scenario 9: Parallel Saga steps
        demonstrateParallelSaga();

        // Scenario 10: Saga timeout handling
        demonstrateSagaTimeout();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic Saga execution with successful completion
     */
    private static void demonstrateBasicSaga() {
        System.out.println("1. Basic Saga Execution");
        System.out.println("-".repeat(50));

        SagaOrchestrator orchestrator = new SagaOrchestrator();
        Saga saga = new Saga("order-saga-1");

        saga.addStep(new SagaStep("reserve-inventory",
            ctx -> {
                System.out.println("  Reserving inventory...");
                ctx.put("inventory-reserved", true);
                return true;
            },
            ctx -> {
                System.out.println("  Releasing inventory...");
                return true;
            }
        ));

        saga.addStep(new SagaStep("process-payment",
            ctx -> {
                System.out.println("  Processing payment...");
                ctx.put("payment-processed", true);
                return true;
            },
            ctx -> {
                System.out.println("  Refunding payment...");
                return true;
            }
        ));

        SagaResult result = orchestrator.execute(saga);
        System.out.println("Saga completed: " + result.isSuccess());
        System.out.println();
    }

    /**
     * Scenario 2: Saga with compensation when a step fails
     */
    private static void demonstrateSagaWithCompensation() {
        System.out.println("2. Saga with Compensation");
        System.out.println("-".repeat(50));

        SagaOrchestrator orchestrator = new SagaOrchestrator();
        Saga saga = new Saga("order-saga-2");

        saga.addStep(new SagaStep("reserve-inventory",
            ctx -> {
                System.out.println("  Reserving inventory... SUCCESS");
                ctx.put("inventory-reserved", true);
                return true;
            },
            ctx -> {
                System.out.println("  COMPENSATING: Releasing inventory");
                return true;
            }
        ));

        saga.addStep(new SagaStep("process-payment",
            ctx -> {
                System.out.println("  Processing payment... FAILED");
                return false; // Simulate failure
            },
            ctx -> {
                System.out.println("  COMPENSATING: Refunding payment");
                return true;
            }
        ));

        SagaResult result = orchestrator.execute(saga);
        System.out.println("Saga completed: " + result.isSuccess());
        System.out.println("Compensations executed: " + result.getCompensationCount());
        System.out.println();
    }

    /**
     * Scenario 3: Choreography-based Saga using event bus
     */
    private static void demonstrateChoreographySaga() {
        System.out.println("3. Choreography-based Saga");
        System.out.println("-".repeat(50));

        EventBus eventBus = new EventBus();

        // Service 1: Order Service
        eventBus.subscribe("OrderCreated", event -> {
            System.out.println("  Order Service: Order created - " + event.getData());
            eventBus.publish(new Event("InventoryReserveRequested", event.getData()));
        });

        // Service 2: Inventory Service
        eventBus.subscribe("InventoryReserveRequested", event -> {
            System.out.println("  Inventory Service: Reserving inventory");
            eventBus.publish(new Event("InventoryReserved", event.getData()));
        });

        // Service 3: Payment Service
        eventBus.subscribe("InventoryReserved", event -> {
            System.out.println("  Payment Service: Processing payment");
            eventBus.publish(new Event("PaymentProcessed", event.getData()));
        });

        // Start the saga
        eventBus.publish(new Event("OrderCreated", "Order-123"));

        // Allow events to propagate
        sleep(100);
        System.out.println();
    }

    /**
     * Scenario 4: Orchestration-based Saga with central coordinator
     */
    private static void demonstrateOrchestrationSaga() {
        System.out.println("4. Orchestration-based Saga");
        System.out.println("-".repeat(50));

        SagaOrchestrator orchestrator = new SagaOrchestrator();

        // Create services
        InventoryService inventoryService = new InventoryService();
        PaymentService paymentService = new PaymentService();
        ShippingService shippingService = new ShippingService();

        Saga saga = new Saga("orchestrated-order");

        saga.addStep(new SagaStep("check-inventory",
            ctx -> inventoryService.checkInventory("item-1", 5),
            ctx -> inventoryService.releaseInventory("item-1", 5)
        ));

        saga.addStep(new SagaStep("charge-customer",
            ctx -> paymentService.charge("customer-1", 100.0),
            ctx -> paymentService.refund("customer-1", 100.0)
        ));

        saga.addStep(new SagaStep("create-shipment",
            ctx -> shippingService.createShipment("order-1"),
            ctx -> shippingService.cancelShipment("order-1")
        ));

        SagaResult result = orchestrator.execute(saga);
        System.out.println("Orchestrated saga completed: " + result.isSuccess());
        System.out.println();
    }

    /**
     * Scenario 5: Order processing Saga with multiple steps
     */
    private static void demonstrateOrderProcessingSaga() {
        System.out.println("5. Order Processing Saga");
        System.out.println("-".repeat(50));

        OrderSaga orderSaga = new OrderSaga();
        Order order = new Order("ORD-001", "CUST-123", 250.0);
        order.addItem(new OrderItem("PROD-1", 2, 75.0));
        order.addItem(new OrderItem("PROD-2", 1, 100.0));

        boolean success = orderSaga.processOrder(order);
        System.out.println("Order processing " + (success ? "SUCCEEDED" : "FAILED"));
        System.out.println();
    }

    /**
     * Scenario 6: Payment Saga with rollback scenario
     */
    private static void demonstratePaymentSaga() {
        System.out.println("6. Payment Saga with Rollback");
        System.out.println("-".repeat(50));

        PaymentSaga paymentSaga = new PaymentSaga();
        PaymentRequest request = new PaymentRequest("PAY-001", 500.0, "customer-1");

        // This will fail at fraud check to demonstrate rollback
        request.setFraudCheckEnabled(true);
        request.setSimulateFraudFailure(true);

        boolean success = paymentSaga.processPayment(request);
        System.out.println("Payment processing " + (success ? "SUCCEEDED" : "FAILED"));
        System.out.println();
    }

    /**
     * Scenario 7: Multi-service booking Saga (hotel + flight + car)
     */
    private static void demonstrateBookingSaga() {
        System.out.println("7. Multi-service Booking Saga");
        System.out.println("-".repeat(50));

        BookingSaga bookingSaga = new BookingSaga();
        TravelBooking booking = new TravelBooking("TRIP-001");
        booking.setHotelRequired(true);
        booking.setFlightRequired(true);
        booking.setCarRequired(true);

        boolean success = bookingSaga.book(booking);
        System.out.println("Booking " + (success ? "CONFIRMED" : "FAILED"));
        System.out.println();
    }

    /**
     * Scenario 8: Failed Saga recovery and retry logic
     */
    private static void demonstrateFailedSagaRecovery() {
        System.out.println("8. Failed Saga Recovery");
        System.out.println("-".repeat(50));

        SagaOrchestrator orchestrator = new SagaOrchestrator();
        orchestrator.setMaxRetries(3);

        Saga saga = new Saga("retry-saga");
        int[] attemptCount = {0};

        saga.addStep(new SagaStep("unstable-operation",
            ctx -> {
                attemptCount[0]++;
                System.out.println("  Attempt " + attemptCount[0]);
                if (attemptCount[0] < 3) {
                    System.out.println("  Operation failed, will retry...");
                    return false;
                }
                System.out.println("  Operation succeeded!");
                return true;
            },
            ctx -> {
                System.out.println("  Compensating unstable operation");
                return true;
            }
        ));

        SagaResult result = orchestrator.execute(saga);
        System.out.println("Saga completed after " + attemptCount[0] + " attempts");
        System.out.println();
    }

    /**
     * Scenario 9: Parallel Saga steps execution
     */
    private static void demonstrateParallelSaga() {
        System.out.println("9. Parallel Saga Steps");
        System.out.println("-".repeat(50));

        ParallelSagaOrchestrator orchestrator = new ParallelSagaOrchestrator();

        List<SagaStep> parallelSteps = Arrays.asList(
            new SagaStep("verify-email",
                ctx -> {
                    System.out.println("  Verifying email...");
                    sleep(50);
                    return true;
                },
                ctx -> true
            ),
            new SagaStep("verify-phone",
                ctx -> {
                    System.out.println("  Verifying phone...");
                    sleep(50);
                    return true;
                },
                ctx -> true
            ),
            new SagaStep("verify-address",
                ctx -> {
                    System.out.println("  Verifying address...");
                    sleep(50);
                    return true;
                },
                ctx -> true
            )
        );

        long startTime = System.currentTimeMillis();
        boolean success = orchestrator.executeParallel(parallelSteps);
        long duration = System.currentTimeMillis() - startTime;

        System.out.println("Parallel steps completed: " + success);
        System.out.println("Duration: " + duration + "ms");
        System.out.println();
    }

    /**
     * Scenario 10: Saga timeout handling
     */
    private static void demonstrateSagaTimeout() {
        System.out.println("10. Saga Timeout Handling");
        System.out.println("-".repeat(50));

        SagaOrchestrator orchestrator = new SagaOrchestrator();
        orchestrator.setTimeout(500); // 500ms timeout

        Saga saga = new Saga("timeout-saga");

        saga.addStep(new SagaStep("long-running-operation",
            ctx -> {
                System.out.println("  Starting long operation...");
                sleep(1000); // Will exceed timeout
                System.out.println("  Operation completed");
                return true;
            },
            ctx -> {
                System.out.println("  Compensating due to timeout");
                return true;
            }
        ));

        try {
            SagaResult result = orchestrator.execute(saga);
            System.out.println("Saga result: " + result.getStatus());
        } catch (Exception e) {
            System.out.println("Saga timed out: " + e.getMessage());
        }
        System.out.println();
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

/**
 * Saga orchestrator that manages saga execution
 */
class SagaOrchestrator {
    private int maxRetries = 1;
    private long timeout = 30000; // 30 seconds default

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }

    public void setTimeout(long timeout) {
        this.timeout = timeout;
    }

    public SagaResult execute(Saga saga) {
        SagaContext context = new SagaContext();
        List<SagaStep> executedSteps = new ArrayList<>();

        for (SagaStep step : saga.getSteps()) {
            boolean success = false;
            int attempts = 0;

            while (attempts < maxRetries && !success) {
                attempts++;
                success = step.execute(context);

                if (!success && attempts < maxRetries) {
                    sleep(100 * attempts); // Exponential backoff
                }
            }

            if (!success) {
                // Compensate all executed steps
                compensate(executedSteps, context);
                return new SagaResult(false, executedSteps.size());
            }

            executedSteps.add(step);
        }

        return new SagaResult(true, 0);
    }

    private void compensate(List<SagaStep> steps, SagaContext context) {
        for (int i = steps.size() - 1; i >= 0; i--) {
            steps.get(i).compensate(context);
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

class Saga {
    private final String id;
    private final List<SagaStep> steps = new ArrayList<>();

    public Saga(String id) {
        this.id = id;
    }

    public void addStep(SagaStep step) {
        steps.add(step);
    }

    public List<SagaStep> getSteps() {
        return steps;
    }

    public String getId() {
        return id;
    }
}

class SagaStep {
    private final String name;
    private final SagaTransaction transaction;
    private final SagaCompensation compensation;

    public SagaStep(String name, SagaTransaction transaction, SagaCompensation compensation) {
        this.name = name;
        this.transaction = transaction;
        this.compensation = compensation;
    }

    public boolean execute(SagaContext context) {
        return transaction.execute(context);
    }

    public boolean compensate(SagaContext context) {
        return compensation.compensate(context);
    }

    public String getName() {
        return name;
    }
}

@FunctionalInterface
interface SagaTransaction {
    boolean execute(SagaContext context);
}

@FunctionalInterface
interface SagaCompensation {
    boolean compensate(SagaContext context);
}

class SagaContext {
    private final Map<String, Object> data = new HashMap<>();

    public void put(String key, Object value) {
        data.put(key, value);
    }

    public Object get(String key) {
        return data.get(key);
    }
}

class SagaResult {
    private final boolean success;
    private final int compensationCount;

    public SagaResult(boolean success, int compensationCount) {
        this.success = success;
        this.compensationCount = compensationCount;
    }

    public boolean isSuccess() {
        return success;
    }

    public int getCompensationCount() {
        return compensationCount;
    }

    public String getStatus() {
        return success ? "SUCCESS" : "FAILED";
    }
}

class EventBus {
    private final Map<String, List<Consumer<Event>>> subscribers = new HashMap<>();

    public void subscribe(String eventType, Consumer<Event> handler) {
        subscribers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
    }

    public void publish(Event event) {
        List<Consumer<Event>> handlers = subscribers.get(event.getType());
        if (handlers != null) {
            handlers.forEach(handler -> handler.accept(event));
        }
    }
}

class Event {
    private final String type;
    private final Object data;

    public Event(String type, Object data) {
        this.type = type;
        this.data = data;
    }

    public String getType() {
        return type;
    }

    public Object getData() {
        return data;
    }
}

class InventoryService {
    public boolean checkInventory(String itemId, int quantity) {
        System.out.println("  Inventory Service: Checking " + quantity + " units of " + itemId);
        return true;
    }

    public boolean releaseInventory(String itemId, int quantity) {
        System.out.println("  Inventory Service: Releasing " + quantity + " units of " + itemId);
        return true;
    }
}

class PaymentService {
    public boolean charge(String customerId, double amount) {
        System.out.println("  Payment Service: Charging $" + amount + " to " + customerId);
        return true;
    }

    public boolean refund(String customerId, double amount) {
        System.out.println("  Payment Service: Refunding $" + amount + " to " + customerId);
        return true;
    }
}

class ShippingService {
    public boolean createShipment(String orderId) {
        System.out.println("  Shipping Service: Creating shipment for " + orderId);
        return true;
    }

    public boolean cancelShipment(String orderId) {
        System.out.println("  Shipping Service: Canceling shipment for " + orderId);
        return true;
    }
}

class Order {
    private final String orderId;
    private final String customerId;
    private final double totalAmount;
    private final List<OrderItem> items = new ArrayList<>();

    public Order(String orderId, String customerId, double totalAmount) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
    }

    public void addItem(OrderItem item) {
        items.add(item);
    }

    public String getOrderId() { return orderId; }
    public String getCustomerId() { return customerId; }
    public double getTotalAmount() { return totalAmount; }
    public List<OrderItem> getItems() { return items; }
}

class OrderItem {
    private final String productId;
    private final int quantity;
    private final double price;

    public OrderItem(String productId, int quantity, double price) {
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }
}

class OrderSaga {
    public boolean processOrder(Order order) {
        System.out.println("  Starting order saga for " + order.getOrderId());
        System.out.println("  Step 1: Validate order");
        System.out.println("  Step 2: Reserve inventory for " + order.getItems().size() + " items");
        System.out.println("  Step 3: Process payment of $" + order.getTotalAmount());
        System.out.println("  Step 4: Create shipment");
        System.out.println("  Step 5: Send confirmation");
        return true;
    }
}

class PaymentRequest {
    private final String paymentId;
    private final double amount;
    private final String customerId;
    private boolean fraudCheckEnabled;
    private boolean simulateFraudFailure;

    public PaymentRequest(String paymentId, double amount, String customerId) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.customerId = customerId;
    }

    public void setFraudCheckEnabled(boolean enabled) {
        this.fraudCheckEnabled = enabled;
    }

    public void setSimulateFraudFailure(boolean simulate) {
        this.simulateFraudFailure = simulate;
    }

    public boolean isFraudCheckEnabled() { return fraudCheckEnabled; }
    public boolean isSimulateFraudFailure() { return simulateFraudFailure; }
}

class PaymentSaga {
    public boolean processPayment(PaymentRequest request) {
        System.out.println("  Step 1: Authorize payment - SUCCESS");
        System.out.println("  Step 2: Fraud check - FAILED");
        System.out.println("  Rollback: Cancel authorization");
        return false;
    }
}

class TravelBooking {
    private final String bookingId;
    private boolean hotelRequired;
    private boolean flightRequired;
    private boolean carRequired;

    public TravelBooking(String bookingId) {
        this.bookingId = bookingId;
    }

    public void setHotelRequired(boolean required) { this.hotelRequired = required; }
    public void setFlightRequired(boolean required) { this.flightRequired = required; }
    public void setCarRequired(boolean required) { this.carRequired = required; }
}

class BookingSaga {
    public boolean book(TravelBooking booking) {
        System.out.println("  Step 1: Book hotel - SUCCESS");
        System.out.println("  Step 2: Book flight - SUCCESS");
        System.out.println("  Step 3: Book rental car - SUCCESS");
        System.out.println("  Step 4: Confirm booking - SUCCESS");
        return true;
    }
}

class ParallelSagaOrchestrator {
    public boolean executeParallel(List<SagaStep> steps) {
        ExecutorService executor = Executors.newFixedThreadPool(steps.size());
        List<Future<Boolean>> futures = new ArrayList<>();

        for (SagaStep step : steps) {
            futures.add(executor.submit(() -> step.execute(new SagaContext())));
        }

        boolean allSuccess = true;
        for (Future<Boolean> future : futures) {
            try {
                allSuccess &= future.get();
            } catch (Exception e) {
                allSuccess = false;
            }
        }

        executor.shutdown();
        return allSuccess;
    }
}
