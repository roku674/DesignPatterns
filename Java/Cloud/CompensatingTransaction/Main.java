package Cloud.CompensatingTransaction;

import java.util.*;
import java.util.concurrent.*;
import java.time.Instant;
import java.time.Duration;

/**
 * CompensatingTransaction Pattern Demonstration
 *
 * The Compensating Transaction pattern undoes the work performed by a series of steps,
 * which together define an eventually consistent operation. This pattern is essential
 * for maintaining data consistency in distributed systems where traditional ACID
 * transactions are not feasible.
 *
 * Key Components:
 * - Transaction Steps: Individual operations that can be compensated
 * - Compensation Logic: Undo operations for each step
 * - Transaction Coordinator: Manages execution and compensation
 * - Transaction Log: Records operations for recovery
 *
 * Cloud Resilience Features:
 * - Automatic rollback on failures
 * - Idempotent compensation operations
 * - Transaction state persistence
 * - Partial failure recovery
 * - Timeout handling
 * - Retry with compensation awareness
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== CompensatingTransaction Pattern Demo ===\n");

        // Scenario 1: Basic compensating transaction
        demonstrateBasicCompensation();

        // Scenario 2: Multi-step transaction with failure
        demonstrateMultiStepCompensation();

        // Scenario 3: Partial compensation
        demonstratePartialCompensation();

        // Scenario 4: Idempotent compensation
        demonstrateIdempotentCompensation();

        // Scenario 5: Async transaction with compensation
        demonstrateAsyncCompensation();

        // Scenario 6: Timeout-triggered compensation
        demonstrateTimeoutCompensation();

        // Scenario 7: Nested transactions
        demonstrateNestedTransactions();

        // Scenario 8: Transaction log and recovery
        demonstrateTransactionRecovery();

        // Scenario 9: Compensation with retries
        demonstrateCompensationRetry();

        // Scenario 10: Complex workflow compensation
        demonstrateComplexWorkflow();

        System.out.println("\nPattern demonstration complete.");
    }

    /**
     * Scenario 1: Basic compensating transaction
     * Demonstrates fundamental compensation operation
     */
    private static void demonstrateBasicCompensation() {
        System.out.println("--- Scenario 1: Basic Compensating Transaction ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();

        TransactionContext context = new TransactionContext("TXN-001");

        // Add transaction steps
        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new ChargePaymentStep(true), context); // Will fail

        // Execute transaction
        boolean success = coordinator.execute(context);

        System.out.println("Transaction result: " + (success ? "SUCCESS" : "FAILED"));
        System.out.println("Transaction state: " + context.getState());

        System.out.println();
    }

    /**
     * Scenario 2: Multi-step transaction with automatic compensation
     * Demonstrates compensation chain
     */
    private static void demonstrateMultiStepCompensation() {
        System.out.println("--- Scenario 2: Multi-Step Transaction with Failure ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        TransactionContext context = new TransactionContext("TXN-002");

        // Create multi-step workflow
        coordinator.addStep(new ValidateOrderStep(), context);
        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new ChargePaymentStep(false), context);
        coordinator.addStep(new CreateShipmentStep(true), context); // Will fail

        boolean success = coordinator.execute(context);

        System.out.println("Transaction completed: " + success);
        System.out.println("Compensation required: " + context.isCompensationRequired());

        System.out.println();
    }

    /**
     * Scenario 3: Partial compensation on mid-transaction failure
     * Demonstrates selective compensation
     */
    private static void demonstratePartialCompensation() {
        System.out.println("--- Scenario 3: Partial Compensation ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        TransactionContext context = new TransactionContext("TXN-003");

        coordinator.addStep(new DebitAccountStep("ACC-001", 100.0), context);
        coordinator.addStep(new DebitAccountStep("ACC-002", 50.0), context);
        coordinator.addStep(new DebitAccountStep("ACC-003", 75.0, true), context); // Fails

        boolean success = coordinator.execute(context);

        System.out.println("Partial transaction result: " + success);
        System.out.println("Steps compensated: " + context.getCompensatedStepsCount());

        System.out.println();
    }

    /**
     * Scenario 4: Idempotent compensation operations
     * Demonstrates safe retry of compensation
     */
    private static void demonstrateIdempotentCompensation() {
        System.out.println("--- Scenario 4: Idempotent Compensation ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        TransactionContext context = new TransactionContext("TXN-004");

        IdempotentReservationStep step = new IdempotentReservationStep();
        coordinator.addStep(step, context);
        coordinator.addStep(new ChargePaymentStep(true), context); // Fails

        coordinator.execute(context);

        // Retry compensation (should be idempotent)
        System.out.println("\nRetrying compensation...");
        coordinator.compensate(context);

        System.out.println();
    }

    /**
     * Scenario 5: Asynchronous transaction with compensation
     * Demonstrates async compensation handling
     */
    private static void demonstrateAsyncCompensation() throws Exception {
        System.out.println("--- Scenario 5: Async Transaction with Compensation ---");

        AsyncTransactionCoordinator coordinator = new AsyncTransactionCoordinator();
        TransactionContext context = new TransactionContext("TXN-005");

        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new AsyncPaymentStep(true), context); // Will fail after delay

        CompletableFuture<Boolean> future = coordinator.executeAsync(context);

        System.out.println("Transaction executing asynchronously...");
        boolean result = future.get();

        System.out.println("Async transaction result: " + result);

        System.out.println();
    }

    /**
     * Scenario 6: Timeout-triggered compensation
     * Demonstrates compensation on timeout
     */
    private static void demonstrateTimeoutCompensation() throws Exception {
        System.out.println("--- Scenario 6: Timeout-Triggered Compensation ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        coordinator.setTimeout(Duration.ofSeconds(2));

        TransactionContext context = new TransactionContext("TXN-006");

        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new SlowOperationStep(), context); // Takes too long

        boolean success = coordinator.execute(context);

        System.out.println("Transaction with timeout result: " + success);
        System.out.println("Timeout occurred: " + context.isTimedOut());

        System.out.println();
    }

    /**
     * Scenario 7: Nested transactions with hierarchical compensation
     * Demonstrates complex transaction structures
     */
    private static void demonstrateNestedTransactions() {
        System.out.println("--- Scenario 7: Nested Transactions ---");

        TransactionCoordinator parentCoordinator = new TransactionCoordinator();
        TransactionContext parentContext = new TransactionContext("TXN-007-PARENT");

        // Parent transaction steps
        parentCoordinator.addStep(new ValidateOrderStep(), parentContext);

        // Nested transaction
        TransactionCoordinator childCoordinator = new TransactionCoordinator();
        TransactionContext childContext = new TransactionContext("TXN-007-CHILD");
        childCoordinator.addStep(new ReserveInventoryStep(), childContext);
        childCoordinator.addStep(new ChargePaymentStep(true), childContext); // Fails

        parentCoordinator.addStep(new NestedTransactionStep(childCoordinator, childContext), parentContext);

        boolean success = parentCoordinator.execute(parentContext);

        System.out.println("Nested transaction result: " + success);

        System.out.println();
    }

    /**
     * Scenario 8: Transaction log and recovery
     * Demonstrates persistent transaction state
     */
    private static void demonstrateTransactionRecovery() {
        System.out.println("--- Scenario 8: Transaction Log and Recovery ---");

        TransactionLog log = new TransactionLog();
        TransactionCoordinator coordinator = new TransactionCoordinator(log);

        TransactionContext context = new TransactionContext("TXN-008");

        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new ChargePaymentStep(true), context); // Fails

        coordinator.execute(context);

        // Simulate recovery
        System.out.println("\nSimulating recovery...");
        List<TransactionContext> pendingTransactions = log.getPendingTransactions();
        for (TransactionContext txn : pendingTransactions) {
            System.out.println("Recovering transaction: " + txn.getTransactionId());
            coordinator.compensate(txn);
        }

        System.out.println();
    }

    /**
     * Scenario 9: Compensation with retry logic
     * Demonstrates resilient compensation
     */
    private static void demonstrateCompensationRetry() {
        System.out.println("--- Scenario 9: Compensation with Retries ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        coordinator.setCompensationRetries(3);

        TransactionContext context = new TransactionContext("TXN-009");

        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new FlakyCompensationStep(2), context); // Fails twice then succeeds
        coordinator.addStep(new ChargePaymentStep(true), context); // Fails

        coordinator.execute(context);

        System.out.println();
    }

    /**
     * Scenario 10: Complex workflow with multiple compensation strategies
     * Demonstrates real-world scenario
     */
    private static void demonstrateComplexWorkflow() {
        System.out.println("--- Scenario 10: Complex Workflow Compensation ---");

        TransactionCoordinator coordinator = new TransactionCoordinator();
        TransactionContext context = new TransactionContext("TXN-010");

        // E-commerce order processing workflow
        coordinator.addStep(new ValidateOrderStep(), context);
        coordinator.addStep(new CheckInventoryStep(), context);
        coordinator.addStep(new ReserveInventoryStep(), context);
        coordinator.addStep(new ValidatePaymentMethodStep(), context);
        coordinator.addStep(new ChargePaymentStep(false), context);
        coordinator.addStep(new CreateShipmentStep(false), context);
        coordinator.addStep(new SendConfirmationStep(true), context); // Fails

        boolean success = coordinator.execute(context);

        System.out.println("Complex workflow result: " + success);
        System.out.println("Steps executed: " + context.getExecutedStepsCount());
        System.out.println("Steps compensated: " + context.getCompensatedStepsCount());

        System.out.println();
    }
}

/**
 * Transaction context holding state and history
 */
class TransactionContext {
    private String transactionId;
    private TransactionState state;
    private List<String> executedSteps;
    private List<String> compensatedSteps;
    private Map<String, Object> data;
    private boolean compensationRequired;
    private boolean timedOut;
    private Instant startTime;

    public TransactionContext(String transactionId) {
        this.transactionId = transactionId;
        this.state = TransactionState.PENDING;
        this.executedSteps = new ArrayList<>();
        this.compensatedSteps = new ArrayList<>();
        this.data = new ConcurrentHashMap<>();
        this.compensationRequired = false;
        this.timedOut = false;
        this.startTime = Instant.now();
    }

    public String getTransactionId() { return transactionId; }
    public TransactionState getState() { return state; }
    public void setState(TransactionState state) { this.state = state; }
    public List<String> getExecutedSteps() { return new ArrayList<>(executedSteps); }
    public void addExecutedStep(String step) { executedSteps.add(step); }
    public void addCompensatedStep(String step) { compensatedSteps.add(step); }
    public int getExecutedStepsCount() { return executedSteps.size(); }
    public int getCompensatedStepsCount() { return compensatedSteps.size(); }
    public Map<String, Object> getData() { return data; }
    public void setData(String key, Object value) { data.put(key, value); }
    public Object getData(String key) { return data.get(key); }
    public boolean isCompensationRequired() { return compensationRequired; }
    public void setCompensationRequired(boolean required) { this.compensationRequired = required; }
    public boolean isTimedOut() { return timedOut; }
    public void setTimedOut(boolean timedOut) { this.timedOut = timedOut; }
    public Instant getStartTime() { return startTime; }
}

/**
 * Transaction state enumeration
 */
enum TransactionState {
    PENDING,
    EXECUTING,
    COMPLETED,
    COMPENSATING,
    COMPENSATED,
    FAILED
}

/**
 * Transaction step interface
 */
interface TransactionStep {
    String getName();
    boolean execute(TransactionContext context);
    void compensate(TransactionContext context);
}

/**
 * Transaction coordinator managing execution and compensation
 */
class TransactionCoordinator {
    private List<TransactionStep> steps;
    private TransactionLog log;
    private Duration timeout;
    private int compensationRetries = 1;

    public TransactionCoordinator() {
        this(null);
    }

    public TransactionCoordinator(TransactionLog log) {
        this.steps = new ArrayList<>();
        this.log = log;
        this.timeout = Duration.ofMinutes(5);
    }

    public void addStep(TransactionStep step, TransactionContext context) {
        steps.add(step);
    }

    public void setTimeout(Duration timeout) {
        this.timeout = timeout;
    }

    public void setCompensationRetries(int retries) {
        this.compensationRetries = retries;
    }

    public boolean execute(TransactionContext context) {
        context.setState(TransactionState.EXECUTING);
        if (log != null) {
            log.logTransaction(context);
        }

        System.out.println("  [COORDINATOR] Starting transaction: " + context.getTransactionId());

        for (TransactionStep step : steps) {
            // Check timeout
            if (Duration.between(context.getStartTime(), Instant.now()).compareTo(timeout) > 0) {
                System.out.println("  [COORDINATOR] Transaction timeout");
                context.setTimedOut(true);
                context.setCompensationRequired(true);
                compensate(context);
                return false;
            }

            try {
                System.out.println("  [COORDINATOR] Executing step: " + step.getName());
                boolean success = step.execute(context);

                if (success) {
                    context.addExecutedStep(step.getName());
                } else {
                    System.out.println("  [COORDINATOR] Step failed: " + step.getName());
                    context.setCompensationRequired(true);
                    compensate(context);
                    context.setState(TransactionState.COMPENSATED);
                    return false;
                }
            } catch (Exception e) {
                System.out.println("  [COORDINATOR] Exception in step: " + step.getName() + " - " + e.getMessage());
                context.setCompensationRequired(true);
                compensate(context);
                context.setState(TransactionState.FAILED);
                return false;
            }
        }

        context.setState(TransactionState.COMPLETED);
        if (log != null) {
            log.markCompleted(context.getTransactionId());
        }
        System.out.println("  [COORDINATOR] Transaction completed successfully");
        return true;
    }

    public void compensate(TransactionContext context) {
        context.setState(TransactionState.COMPENSATING);
        System.out.println("  [COORDINATOR] Starting compensation for: " + context.getTransactionId());

        List<String> executedSteps = context.getExecutedSteps();

        // Compensate in reverse order
        for (int i = steps.size() - 1; i >= 0; i--) {
            TransactionStep step = steps.get(i);

            if (executedSteps.contains(step.getName())) {
                compensateWithRetry(step, context);
            }
        }

        if (log != null) {
            log.markCompensated(context.getTransactionId());
        }
        System.out.println("  [COORDINATOR] Compensation completed");
    }

    private void compensateWithRetry(TransactionStep step, TransactionContext context) {
        for (int attempt = 1; attempt <= compensationRetries; attempt++) {
            try {
                System.out.println("  [COORDINATOR] Compensating step: " + step.getName() +
                    (attempt > 1 ? " (attempt " + attempt + ")" : ""));
                step.compensate(context);
                context.addCompensatedStep(step.getName());
                return;
            } catch (Exception e) {
                System.out.println("  [COORDINATOR] Compensation attempt " + attempt + " failed: " + e.getMessage());
                if (attempt < compensationRetries) {
                    try {
                        Thread.sleep(100 * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
        System.out.println("  [COORDINATOR] WARNING - Compensation failed after " + compensationRetries + " attempts");
    }
}

/**
 * Async transaction coordinator
 */
class AsyncTransactionCoordinator extends TransactionCoordinator {
    private ExecutorService executor = Executors.newFixedThreadPool(5);

    public CompletableFuture<Boolean> executeAsync(TransactionContext context) {
        return CompletableFuture.supplyAsync(() -> execute(context), executor);
    }
}

/**
 * Transaction log for persistence and recovery
 */
class TransactionLog {
    private Map<String, TransactionContext> transactions = new ConcurrentHashMap<>();

    public void logTransaction(TransactionContext context) {
        transactions.put(context.getTransactionId(), context);
        System.out.println("  [LOG] Transaction logged: " + context.getTransactionId());
    }

    public void markCompleted(String transactionId) {
        TransactionContext context = transactions.get(transactionId);
        if (context != null) {
            context.setState(TransactionState.COMPLETED);
        }
    }

    public void markCompensated(String transactionId) {
        TransactionContext context = transactions.get(transactionId);
        if (context != null) {
            context.setState(TransactionState.COMPENSATED);
        }
    }

    public List<TransactionContext> getPendingTransactions() {
        List<TransactionContext> pending = new ArrayList<>();
        for (TransactionContext context : transactions.values()) {
            if (context.getState() == TransactionState.EXECUTING ||
                context.getState() == TransactionState.COMPENSATING) {
                pending.add(context);
            }
        }
        return pending;
    }
}

// Transaction Steps

class ValidateOrderStep implements TransactionStep {
    @Override
    public String getName() { return "ValidateOrder"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [VALIDATE] Order validated");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [VALIDATE] Compensation not required (read-only operation)");
    }
}

class CheckInventoryStep implements TransactionStep {
    @Override
    public String getName() { return "CheckInventory"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [INVENTORY] Inventory checked");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [INVENTORY] Compensation not required (read-only operation)");
    }
}

class ReserveInventoryStep implements TransactionStep {
    @Override
    public String getName() { return "ReserveInventory"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [INVENTORY] Reserved inventory");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [INVENTORY] Released inventory reservation");
    }
}

class ValidatePaymentMethodStep implements TransactionStep {
    @Override
    public String getName() { return "ValidatePaymentMethod"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [PAYMENT] Payment method validated");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [PAYMENT] Compensation not required (read-only operation)");
    }
}

class ChargePaymentStep implements TransactionStep {
    private boolean simulateFailure;

    public ChargePaymentStep(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @Override
    public String getName() { return "ChargePayment"; }

    @Override
    public boolean execute(TransactionContext context) {
        if (simulateFailure) {
            System.out.println("    [PAYMENT] Payment charge failed");
            return false;
        }
        System.out.println("    [PAYMENT] Payment charged");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [PAYMENT] Payment refunded");
    }
}

class CreateShipmentStep implements TransactionStep {
    private boolean simulateFailure;

    public CreateShipmentStep(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @Override
    public String getName() { return "CreateShipment"; }

    @Override
    public boolean execute(TransactionContext context) {
        if (simulateFailure) {
            System.out.println("    [SHIPPING] Shipment creation failed");
            return false;
        }
        System.out.println("    [SHIPPING] Shipment created");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [SHIPPING] Shipment cancelled");
    }
}

class SendConfirmationStep implements TransactionStep {
    private boolean simulateFailure;

    public SendConfirmationStep(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @Override
    public String getName() { return "SendConfirmation"; }

    @Override
    public boolean execute(TransactionContext context) {
        if (simulateFailure) {
            System.out.println("    [NOTIFICATION] Confirmation send failed");
            return false;
        }
        System.out.println("    [NOTIFICATION] Confirmation sent");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [NOTIFICATION] Sent cancellation notification");
    }
}

class DebitAccountStep implements TransactionStep {
    private String accountId;
    private double amount;
    private boolean simulateFailure;

    public DebitAccountStep(String accountId, double amount) {
        this(accountId, amount, false);
    }

    public DebitAccountStep(String accountId, double amount, boolean simulateFailure) {
        this.accountId = accountId;
        this.amount = amount;
        this.simulateFailure = simulateFailure;
    }

    @Override
    public String getName() { return "DebitAccount-" + accountId; }

    @Override
    public boolean execute(TransactionContext context) {
        if (simulateFailure) {
            System.out.println("    [ACCOUNT] Failed to debit " + accountId + ": $" + amount);
            return false;
        }
        System.out.println("    [ACCOUNT] Debited " + accountId + ": $" + amount);
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [ACCOUNT] Credited " + accountId + ": $" + amount + " (compensation)");
    }
}

class IdempotentReservationStep implements TransactionStep {
    private Set<String> compensatedTransactions = ConcurrentHashMap.newKeySet();

    @Override
    public String getName() { return "IdempotentReservation"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [IDEMPOTENT] Reserved resources");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        if (compensatedTransactions.contains(context.getTransactionId())) {
            System.out.println("    [IDEMPOTENT] Already compensated - skipping");
            return;
        }
        System.out.println("    [IDEMPOTENT] Released resources");
        compensatedTransactions.add(context.getTransactionId());
    }
}

class AsyncPaymentStep implements TransactionStep {
    private boolean simulateFailure;

    public AsyncPaymentStep(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @Override
    public String getName() { return "AsyncPayment"; }

    @Override
    public boolean execute(TransactionContext context) {
        try {
            Thread.sleep(500); // Simulate async processing
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (simulateFailure) {
            System.out.println("    [ASYNC-PAYMENT] Payment processing failed");
            return false;
        }
        System.out.println("    [ASYNC-PAYMENT] Payment processed");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [ASYNC-PAYMENT] Payment reversed");
    }
}

class SlowOperationStep implements TransactionStep {
    @Override
    public String getName() { return "SlowOperation"; }

    @Override
    public boolean execute(TransactionContext context) {
        try {
            System.out.println("    [SLOW] Operation starting (will timeout)...");
            Thread.sleep(5000); // Exceeds timeout
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [SLOW] Operation cancelled");
    }
}

class FlakyCompensationStep implements TransactionStep {
    private int failuresRemaining;

    public FlakyCompensationStep(int failureCount) {
        this.failuresRemaining = failureCount;
    }

    @Override
    public String getName() { return "FlakyCompensation"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [FLAKY] Operation executed");
        return true;
    }

    @Override
    public void compensate(TransactionContext context) {
        if (failuresRemaining > 0) {
            failuresRemaining--;
            throw new RuntimeException("Compensation temporarily unavailable");
        }
        System.out.println("    [FLAKY] Compensation successful");
    }
}

class NestedTransactionStep implements TransactionStep {
    private TransactionCoordinator nestedCoordinator;
    private TransactionContext nestedContext;

    public NestedTransactionStep(TransactionCoordinator coordinator, TransactionContext context) {
        this.nestedCoordinator = coordinator;
        this.nestedContext = context;
    }

    @Override
    public String getName() { return "NestedTransaction"; }

    @Override
    public boolean execute(TransactionContext context) {
        System.out.println("    [NESTED] Executing nested transaction");
        return nestedCoordinator.execute(nestedContext);
    }

    @Override
    public void compensate(TransactionContext context) {
        System.out.println("    [NESTED] Compensating nested transaction");
        nestedCoordinator.compensate(nestedContext);
    }
}
