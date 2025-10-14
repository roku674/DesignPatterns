package Cloud.Saga;

import java.util.concurrent.CompletableFuture;

/**
 * Demonstrates the Saga Pattern for Distributed Transactions.
 *
 * The Saga pattern manages data consistency across microservices in distributed transaction
 * scenarios. Instead of traditional ACID transactions, it uses a sequence of local transactions
 * with compensating transactions for rollback.
 *
 * Key Concepts:
 * - Break large transaction into smaller local transactions
 * - Each step has a compensating transaction for rollback
 * - Either all steps succeed or compensating transactions undo changes
 * - Eventual consistency instead of immediate consistency
 *
 * Types:
 * 1. Choreography: Decentralized, event-driven coordination
 * 2. Orchestration: Centralized coordinator manages the saga
 *
 * Use Cases:
 * - E-commerce order processing
 * - Travel booking systems
 * - Payment processing workflows
 * - Multi-step business processes across services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Saga Pattern Demo ===\n");

        demonstrateSuccessfulSaga();
        demonstrateFailedSagaWithCompensation();
        demonstrateOrchestrationSaga();
        demonstrateChoreographySaga();
        demonstrateAsyncSaga();
        demonstrateRealWorldScenarios();

        System.out.println("\n=== Saga Pattern Complete ===");
    }

    /**
     * Demonstrates a successful saga where all steps complete.
     */
    private static void demonstrateSuccessfulSaga() {
        System.out.println("\n--- Successful Saga Demo ---");

        // Create services
        OrderService orderService = new OrderService();
        PaymentService paymentService = new PaymentService();
        InventoryService inventoryService = new InventoryService();
        ShippingService shippingService = new ShippingService();

        // Build saga
        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep(
                        "Create Order",
                        () -> orderService.createOrder("ORD-001", "customer-123"),
                        () -> orderService.cancelOrder("ORD-001")))
                .addStep(new SagaStep(
                        "Reserve Inventory",
                        () -> inventoryService.reserveItems("ORD-001", "ITEM-456", 2),
                        () -> inventoryService.releaseItems("ORD-001")))
                .addStep(new SagaStep(
                        "Process Payment",
                        () -> paymentService.charge("customer-123", 99.99),
                        () -> paymentService.refund("customer-123", 99.99)))
                .addStep(new SagaStep(
                        "Arrange Shipping",
                        () -> shippingService.scheduleDelivery("ORD-001", "123 Main St"),
                        () -> shippingService.cancelDelivery("ORD-001")))
                .build();

        // Execute saga
        SagaExecutionResult result = saga.execute();

        System.out.println("\nSaga Result: " + (result.isSuccess() ? "SUCCESS" : "FAILED"));
        System.out.println("Steps completed: " + result.getCompletedSteps());
        System.out.println("Total duration: " + result.getDurationMillis() + "ms");
    }

    /**
     * Demonstrates a failed saga with compensating transactions.
     */
    private static void demonstrateFailedSagaWithCompensation() {
        System.out.println("\n--- Failed Saga with Compensation Demo ---");

        // Create services (payment will fail)
        OrderService orderService = new OrderService();
        PaymentService paymentService = new PaymentService();
        paymentService.setWillFail(true); // Force payment to fail
        InventoryService inventoryService = new InventoryService();

        // Build saga
        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep(
                        "Create Order",
                        () -> orderService.createOrder("ORD-002", "customer-456"),
                        () -> orderService.cancelOrder("ORD-002")))
                .addStep(new SagaStep(
                        "Reserve Inventory",
                        () -> inventoryService.reserveItems("ORD-002", "ITEM-789", 1),
                        () -> inventoryService.releaseItems("ORD-002")))
                .addStep(new SagaStep(
                        "Process Payment",
                        () -> paymentService.charge("customer-456", 149.99),
                        () -> paymentService.refund("customer-456", 149.99)))
                .build();

        // Execute saga
        SagaExecutionResult result = saga.execute();

        System.out.println("\nSaga Result: " + (result.isSuccess() ? "SUCCESS" : "FAILED"));
        System.out.println("Failed at step: " + result.getFailedStep());
        System.out.println("Error: " + result.getError());
        System.out.println("Compensations executed: " + result.getCompensatedSteps());
    }

    /**
     * Demonstrates orchestration-based saga with central coordinator.
     */
    private static void demonstrateOrchestrationSaga() {
        System.out.println("\n--- Orchestration Saga Demo ---");

        System.out.println("Order Processing Workflow:");
        System.out.println("  [Orchestrator] -> [Order Service]");
        System.out.println("  [Orchestrator] -> [Payment Service]");
        System.out.println("  [Orchestrator] -> [Inventory Service]");
        System.out.println("  [Orchestrator] -> [Shipping Service]");

        // Orchestrator coordinates all services
        OrderOrchestrator orchestrator = new OrderOrchestrator();
        OrchestrationResult result = orchestrator.processOrder("ORD-003", "customer-789", 199.99);

        System.out.println("\nOrchestration completed:");
        System.out.println("  Status: " + result.getStatus());
        System.out.println("  Order ID: " + result.getOrderId());
        System.out.println("  Steps: " + String.join(" -> ", result.getSteps()));
    }

    /**
     * Demonstrates choreography-based saga with event-driven coordination.
     */
    private static void demonstrateChoreographySaga() {
        System.out.println("\n--- Choreography Saga Demo ---");

        System.out.println("Event-Driven Workflow:");
        System.out.println("  [Order Service] --> OrderCreated event");
        System.out.println("  [Inventory Service] listens --> InventoryReserved event");
        System.out.println("  [Payment Service] listens --> PaymentProcessed event");
        System.out.println("  [Shipping Service] listens --> ShippingScheduled event");

        // Create event bus
        EventBus eventBus = new EventBus();

        // Register service listeners
        OrderService orderService = new OrderService();
        InventoryService inventoryService = new InventoryService();
        PaymentService paymentService = new PaymentService();
        ShippingService shippingService = new ShippingService();

        // Set up choreography
        eventBus.subscribe("OrderCreated", event -> {
            inventoryService.reserveItems(event.getOrderId(), "ITEM-001", 1);
            eventBus.publish(new SagaEvent("InventoryReserved", event.getOrderId()));
        });

        eventBus.subscribe("InventoryReserved", event -> {
            try {
                paymentService.charge("customer-001", 99.99);
                eventBus.publish(new SagaEvent("PaymentProcessed", event.getOrderId()));
            } catch (Exception e) {
                System.out.println("    Payment failed: " + e.getMessage());
            }
        });

        eventBus.subscribe("PaymentProcessed", event -> {
            shippingService.scheduleDelivery(event.getOrderId(), "456 Oak Ave");
            eventBus.publish(new SagaEvent("ShippingScheduled", event.getOrderId()));
        });

        // Start choreography
        System.out.println("\nStarting choreography...");
        String orderId = orderService.createOrder("ORD-004", "customer-001");
        eventBus.publish(new SagaEvent("OrderCreated", orderId));

        // Allow events to propagate
        sleep(500);
        System.out.println("\nChoreography completed via event chain");
    }

    /**
     * Demonstrates async saga execution with CompletableFuture.
     */
    private static void demonstrateAsyncSaga() {
        System.out.println("\n--- Async Saga Demo ---");

        OrderService orderService = new OrderService();
        PaymentService paymentService = new PaymentService();
        InventoryService inventoryService = new InventoryService();

        // Build async saga
        CompletableFuture<String> sagaFuture = CompletableFuture
                .supplyAsync(() -> {
                    System.out.println("  [Async] Step 1: Creating order...");
                    return orderService.createOrder("ORD-005", "customer-async");
                })
                .thenCompose(orderId -> CompletableFuture.supplyAsync(() -> {
                    System.out.println("  [Async] Step 2: Reserving inventory...");
                    inventoryService.reserveItems(orderId, "ITEM-999", 3);
                    return orderId;
                }))
                .thenCompose(orderId -> CompletableFuture.supplyAsync(() -> {
                    System.out.println("  [Async] Step 3: Processing payment...");
                    try {
                        paymentService.charge("customer-async", 299.99);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                    return orderId;
                }))
                .thenApply(orderId -> {
                    System.out.println("  [Async] Saga completed for order: " + orderId);
                    return orderId;
                })
                .exceptionally(ex -> {
                    System.out.println("  [Async] Saga failed: " + ex.getMessage());
                    System.out.println("  [Async] Executing compensations...");
                    return null;
                });

        // Wait for completion
        sagaFuture.join();
    }

    /**
     * Demonstrates real-world cloud scenarios.
     */
    private static void demonstrateRealWorldScenarios() {
        System.out.println("\n--- Real-World Scenarios ---");

        // Scenario 1: E-commerce order
        System.out.println("\n1. E-commerce Order Processing:");
        processEcommerceOrder();

        // Scenario 2: Travel booking
        System.out.println("\n2. Travel Booking Saga:");
        processTravelBooking();

        // Scenario 3: Financial transaction
        System.out.println("\n3. Financial Transaction Saga:");
        processFinancialTransaction();

        // Scenario 4: Supply chain
        System.out.println("\n4. Supply Chain Saga:");
        processSupplyChain();
    }

    private static void processEcommerceOrder() {
        OrderService orders = new OrderService();
        InventoryService inventory = new InventoryService();
        PaymentService payment = new PaymentService();
        ShippingService shipping = new ShippingService();
        NotificationService notification = new NotificationService();

        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep("Validate Cart",
                    () -> orders.validateCart("cart-123"),
                    () -> "Cart validation rollback"))
                .addStep(new SagaStep("Create Order",
                    () -> orders.createOrder("ORD-E001", "cust-123"),
                    () -> orders.cancelOrder("ORD-E001")))
                .addStep(new SagaStep("Reserve Stock",
                    () -> inventory.reserveItems("ORD-E001", "PROD-456", 2),
                    () -> inventory.releaseItems("ORD-E001")))
                .addStep(new SagaStep("Apply Discounts",
                    () -> orders.applyDiscount("ORD-E001", 10.0),
                    () -> orders.removeDiscount("ORD-E001")))
                .addStep(new SagaStep("Charge Payment",
                    () -> payment.charge("cust-123", 89.99),
                    () -> payment.refund("cust-123", 89.99)))
                .addStep(new SagaStep("Arrange Delivery",
                    () -> shipping.scheduleDelivery("ORD-E001", "789 Elm St"),
                    () -> shipping.cancelDelivery("ORD-E001")))
                .addStep(new SagaStep("Send Confirmation",
                    () -> notification.send("cust-123", "Order confirmed!"),
                    () -> "No compensation needed"))
                .build();

        SagaExecutionResult result = saga.execute();
        System.out.println("   Order saga: " + (result.isSuccess() ? "COMPLETED" : "FAILED"));
    }

    private static void processTravelBooking() {
        FlightService flights = new FlightService();
        HotelService hotels = new HotelService();
        PaymentService payment = new PaymentService();
        CarRentalService cars = new CarRentalService();

        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep("Book Flight",
                    () -> flights.bookFlight("FL-123", "JFK", "LAX"),
                    () -> flights.cancelFlight("FL-123")))
                .addStep(new SagaStep("Book Hotel",
                    () -> hotels.bookRoom("HTL-456", "2024-12-01", 3),
                    () -> hotels.cancelRoom("HTL-456")))
                .addStep(new SagaStep("Book Car",
                    () -> cars.reserveCar("CAR-789", "2024-12-01", 3),
                    () -> cars.cancelCar("CAR-789")))
                .addStep(new SagaStep("Process Payment",
                    () -> payment.charge("traveler-001", 1499.99),
                    () -> payment.refund("traveler-001", 1499.99)))
                .build();

        SagaExecutionResult result = saga.execute();
        System.out.println("   Travel saga: " + (result.isSuccess() ? "COMPLETED" : "FAILED"));
    }

    private static void processFinancialTransaction() {
        AccountService accounts = new AccountService();
        FraudService fraud = new FraudService();
        LedgerService ledger = new LedgerService();

        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep("Check Fraud",
                    () -> fraud.checkTransaction("TXN-001", 5000.0),
                    () -> "No rollback needed"))
                .addStep(new SagaStep("Debit Source",
                    () -> accounts.debit("ACC-SRC", 5000.0),
                    () -> accounts.credit("ACC-SRC", 5000.0)))
                .addStep(new SagaStep("Credit Destination",
                    () -> accounts.credit("ACC-DST", 5000.0),
                    () -> accounts.debit("ACC-DST", 5000.0)))
                .addStep(new SagaStep("Record Ledger",
                    () -> ledger.record("TXN-001", "ACC-SRC", "ACC-DST", 5000.0),
                    () -> ledger.reverse("TXN-001")))
                .build();

        SagaExecutionResult result = saga.execute();
        System.out.println("   Financial saga: " + (result.isSuccess() ? "COMPLETED" : "FAILED"));
    }

    private static void processSupplyChain() {
        SupplierService supplier = new SupplierService();
        WarehouseService warehouse = new WarehouseService();
        TransportService transport = new TransportService();

        SagaOrchestrator saga = SagaOrchestrator.builder()
                .addStep(new SagaStep("Order from Supplier",
                    () -> supplier.placeOrder("PO-001", "WIDGET-500", 1000),
                    () -> supplier.cancelOrder("PO-001")))
                .addStep(new SagaStep("Allocate Warehouse",
                    () -> warehouse.allocateSpace("WH-001", 1000),
                    () -> warehouse.releaseSpace("WH-001")))
                .addStep(new SagaStep("Schedule Transport",
                    () -> transport.schedulePickup("PO-001", "2024-12-15"),
                    () -> transport.cancelPickup("PO-001")))
                .build();

        SagaExecutionResult result = saga.execute();
        System.out.println("   Supply chain saga: " + (result.isSuccess() ? "COMPLETED" : "FAILED"));
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
