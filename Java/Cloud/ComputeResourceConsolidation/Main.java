package Cloud.ComputeResourceConsolidation;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.time.Instant;
import java.time.Duration;

/**
 * ComputeResourceConsolidation Pattern Demonstration
 *
 * This pattern consolidates multiple tasks or services into a single compute unit
 * to optimize resource utilization and reduce costs. It demonstrates:
 * - Multi-tenant workload consolidation
 * - Resource pooling and sharing
 * - Dynamic task scheduling
 * - Load balancing across consolidated resources
 * - Cost optimization through efficient resource usage
 * - Isolation and priority management
 * - Auto-scaling based on consolidated load
 * - Performance monitoring and metrics
 *
 * Key Benefits:
 * - Reduced infrastructure costs
 * - Better resource utilization
 * - Simplified management
 * - Improved efficiency
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ComputeResourceConsolidation Pattern Demo ===\n");

        // Scenario 1: Basic Resource Consolidation
        demonstrateBasicConsolidation();

        // Scenario 2: Multi-Tenant Workload Consolidation
        demonstrateMultiTenantConsolidation();

        // Scenario 3: Priority-Based Task Scheduling
        demonstratePriorityScheduling();

        // Scenario 4: Resource Pool Management
        demonstrateResourcePooling();

        // Scenario 5: Dynamic Load Balancing
        demonstrateDynamicLoadBalancing();

        // Scenario 6: Auto-Scaling Consolidated Resources
        demonstrateAutoScaling();

        // Scenario 7: Cost Optimization Tracking
        demonstrateCostOptimization();

        // Scenario 8: Fault Isolation in Consolidated Environment
        demonstrateFaultIsolation();

        // Scenario 9: Performance Monitoring and Metrics
        demonstratePerformanceMonitoring();

        // Scenario 10: Async Task Processing with Backpressure
        demonstrateAsyncProcessingWithBackpressure();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Demonstrates basic consolidation of multiple tasks into a single compute unit
     */
    private static void demonstrateBasicConsolidation() throws InterruptedException {
        System.out.println("Scenario 1: Basic Resource Consolidation");
        System.out.println("----------------------------------------");

        ConsolidatedComputeUnit computeUnit = new ConsolidatedComputeUnit("BasicUnit", 4);

        // Submit various tasks to consolidated unit
        computeUnit.submitTask(new ComputeTask("DataProcessing", 100, TaskType.CPU_INTENSIVE));
        computeUnit.submitTask(new ComputeTask("ImageResize", 50, TaskType.IO_INTENSIVE));
        computeUnit.submitTask(new ComputeTask("EmailSend", 30, TaskType.NETWORK_INTENSIVE));
        computeUnit.submitTask(new ComputeTask("LogAnalysis", 80, TaskType.CPU_INTENSIVE));

        Thread.sleep(500);
        computeUnit.printStats();
        computeUnit.shutdown();
        System.out.println();
    }

    /**
     * Scenario 2: Demonstrates multi-tenant workload consolidation with isolation
     */
    private static void demonstrateMultiTenantConsolidation() throws InterruptedException {
        System.out.println("Scenario 2: Multi-Tenant Workload Consolidation");
        System.out.println("-----------------------------------------------");

        MultiTenantConsolidator consolidator = new MultiTenantConsolidator(6);

        // Different tenants submitting workloads
        consolidator.submitTenantTask("TenantA", new ComputeTask("APIRequest", 40, TaskType.NETWORK_INTENSIVE));
        consolidator.submitTenantTask("TenantB", new ComputeTask("ReportGen", 120, TaskType.CPU_INTENSIVE));
        consolidator.submitTenantTask("TenantA", new ComputeTask("DataSync", 60, TaskType.IO_INTENSIVE));
        consolidator.submitTenantTask("TenantC", new ComputeTask("Analytics", 90, TaskType.CPU_INTENSIVE));
        consolidator.submitTenantTask("TenantB", new ComputeTask("Backup", 70, TaskType.IO_INTENSIVE));

        Thread.sleep(500);
        consolidator.printTenantStats();
        consolidator.shutdown();
        System.out.println();
    }

    /**
     * Scenario 3: Demonstrates priority-based task scheduling in consolidated environment
     */
    private static void demonstratePriorityScheduling() throws InterruptedException {
        System.out.println("Scenario 3: Priority-Based Task Scheduling");
        System.out.println("------------------------------------------");

        PriorityConsolidator priorityUnit = new PriorityConsolidator(3);

        // Submit tasks with different priorities
        priorityUnit.submitTask(new PriorityTask("CriticalAlert", 50, Priority.CRITICAL));
        priorityUnit.submitTask(new PriorityTask("BatchJob", 100, Priority.LOW));
        priorityUnit.submitTask(new PriorityTask("UserRequest", 40, Priority.HIGH));
        priorityUnit.submitTask(new PriorityTask("Monitoring", 30, Priority.MEDIUM));
        priorityUnit.submitTask(new PriorityTask("EmergencyFix", 60, Priority.CRITICAL));

        Thread.sleep(500);
        priorityUnit.printExecutionOrder();
        priorityUnit.shutdown();
        System.out.println();
    }

    /**
     * Scenario 4: Demonstrates resource pool management for consolidated compute
     */
    private static void demonstrateResourcePooling() throws InterruptedException {
        System.out.println("Scenario 4: Resource Pool Management");
        System.out.println("------------------------------------");

        ResourcePool pool = new ResourcePool(5, 10);

        // Acquire and use resources
        CompletableFuture<Void> future1 = CompletableFuture.runAsync(() -> {
            ComputeResource resource = pool.acquireResource();
            System.out.println("Thread-" + Thread.currentThread().getId() + " acquired: " + resource.getId());
            resource.execute("Processing-1", 100);
            pool.releaseResource(resource);
        });

        CompletableFuture<Void> future2 = CompletableFuture.runAsync(() -> {
            ComputeResource resource = pool.acquireResource();
            System.out.println("Thread-" + Thread.currentThread().getId() + " acquired: " + resource.getId());
            resource.execute("Processing-2", 80);
            pool.releaseResource(resource);
        });

        CompletableFuture.allOf(future1, future2).join();
        pool.printPoolStats();
        pool.shutdown();
        System.out.println();
    }

    /**
     * Scenario 5: Demonstrates dynamic load balancing across consolidated resources
     */
    private static void demonstrateDynamicLoadBalancing() throws InterruptedException {
        System.out.println("Scenario 5: Dynamic Load Balancing");
        System.out.println("----------------------------------");

        LoadBalancedConsolidator balancer = new LoadBalancedConsolidator(4);

        // Submit multiple tasks that will be balanced across resources
        for (int i = 0; i < 12; i++) {
            balancer.submitTask(new ComputeTask("Task-" + i, 50 + (i * 10), TaskType.CPU_INTENSIVE));
        }

        Thread.sleep(500);
        balancer.printLoadDistribution();
        balancer.shutdown();
        System.out.println();
    }

    /**
     * Scenario 6: Demonstrates auto-scaling of consolidated resources based on load
     */
    private static void demonstrateAutoScaling() throws InterruptedException {
        System.out.println("Scenario 6: Auto-Scaling Consolidated Resources");
        System.out.println("-----------------------------------------------");

        AutoScalingConsolidator scaler = new AutoScalingConsolidator(2, 8, 0.7, 0.3);

        // Start with low load
        scaler.submitTask(new ComputeTask("LowLoad-1", 50, TaskType.CPU_INTENSIVE));
        Thread.sleep(200);
        System.out.println("Initial capacity: " + scaler.getCurrentCapacity());

        // Increase load to trigger scale-up
        for (int i = 0; i < 10; i++) {
            scaler.submitTask(new ComputeTask("HighLoad-" + i, 80, TaskType.CPU_INTENSIVE));
        }
        Thread.sleep(300);
        System.out.println("Capacity after scale-up: " + scaler.getCurrentCapacity());

        // Allow processing and scale-down
        Thread.sleep(500);
        System.out.println("Final capacity after scale-down: " + scaler.getCurrentCapacity());

        scaler.shutdown();
        System.out.println();
    }

    /**
     * Scenario 7: Demonstrates cost optimization through resource consolidation
     */
    private static void demonstrateCostOptimization() throws InterruptedException {
        System.out.println("Scenario 7: Cost Optimization Tracking");
        System.out.println("--------------------------------------");

        CostOptimizedConsolidator costOptimizer = new CostOptimizedConsolidator(3, 0.05);

        // Process tasks and track cost savings
        for (int i = 0; i < 15; i++) {
            costOptimizer.submitTask(new ComputeTask("CostTask-" + i, 40, TaskType.CPU_INTENSIVE));
        }

        Thread.sleep(500);
        costOptimizer.printCostAnalysis();
        costOptimizer.shutdown();
        System.out.println();
    }

    /**
     * Scenario 8: Demonstrates fault isolation in consolidated environment
     */
    private static void demonstrateFaultIsolation() throws InterruptedException {
        System.out.println("Scenario 8: Fault Isolation in Consolidated Environment");
        System.out.println("-------------------------------------------------------");

        FaultIsolatedConsolidator faultIsolator = new FaultIsolatedConsolidator(4);

        // Submit normal tasks
        faultIsolator.submitTask(new ComputeTask("NormalTask-1", 50, TaskType.CPU_INTENSIVE));
        faultIsolator.submitTask(new ComputeTask("FailingTask", 60, TaskType.CPU_INTENSIVE, true));
        faultIsolator.submitTask(new ComputeTask("NormalTask-2", 40, TaskType.CPU_INTENSIVE));

        Thread.sleep(500);
        faultIsolator.printHealthStats();
        faultIsolator.shutdown();
        System.out.println();
    }

    /**
     * Scenario 9: Demonstrates performance monitoring and metrics collection
     */
    private static void demonstratePerformanceMonitoring() throws InterruptedException {
        System.out.println("Scenario 9: Performance Monitoring and Metrics");
        System.out.println("----------------------------------------------");

        MonitoredConsolidator monitor = new MonitoredConsolidator(4);

        // Execute tasks while monitoring performance
        for (int i = 0; i < 8; i++) {
            monitor.submitTask(new ComputeTask("MonitoredTask-" + i, 60 + (i * 5), TaskType.CPU_INTENSIVE));
        }

        Thread.sleep(500);
        monitor.printPerformanceMetrics();
        monitor.shutdown();
        System.out.println();
    }

    /**
     * Scenario 10: Demonstrates async task processing with backpressure handling
     */
    private static void demonstrateAsyncProcessingWithBackpressure() throws InterruptedException {
        System.out.println("Scenario 10: Async Task Processing with Backpressure");
        System.out.println("----------------------------------------------------");

        BackpressureConsolidator backpressureUnit = new BackpressureConsolidator(3, 10);

        // Rapidly submit tasks to test backpressure
        CompletableFuture<Void> submitter = CompletableFuture.runAsync(() -> {
            for (int i = 0; i < 20; i++) {
                boolean accepted = backpressureUnit.trySubmitTask(
                    new ComputeTask("AsyncTask-" + i, 50, TaskType.CPU_INTENSIVE)
                );
                System.out.println("Task-" + i + " " + (accepted ? "accepted" : "rejected (backpressure)"));
                try {
                    Thread.sleep(30);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        submitter.join();
        Thread.sleep(500);
        backpressureUnit.printBackpressureStats();
        backpressureUnit.shutdown();
        System.out.println();
    }
}

/**
 * Enumeration of task types for workload classification
 */
enum TaskType {
    CPU_INTENSIVE,
    IO_INTENSIVE,
    NETWORK_INTENSIVE,
    MEMORY_INTENSIVE
}

/**
 * Enumeration of task priorities
 */
enum Priority {
    CRITICAL(4),
    HIGH(3),
    MEDIUM(2),
    LOW(1);

    private final int value;

    Priority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}

/**
 * Represents a compute task that can be executed on consolidated resources
 */
class ComputeTask {
    private final String name;
    private final long durationMs;
    private final TaskType type;
    private final boolean shouldFail;
    private final Instant submittedAt;

    public ComputeTask(String name, long durationMs, TaskType type) {
        this(name, durationMs, type, false);
    }

    public ComputeTask(String name, long durationMs, TaskType type, boolean shouldFail) {
        this.name = name;
        this.durationMs = durationMs;
        this.type = type;
        this.shouldFail = shouldFail;
        this.submittedAt = Instant.now();
    }

    public void execute() throws Exception {
        if (shouldFail) {
            throw new RuntimeException("Simulated task failure: " + name);
        }
        Thread.sleep(durationMs);
    }

    public String getName() { return name; }
    public long getDurationMs() { return durationMs; }
    public TaskType getType() { return type; }
    public Instant getSubmittedAt() { return submittedAt; }
}

/**
 * Task with priority information
 */
class PriorityTask extends ComputeTask implements Comparable<PriorityTask> {
    private final Priority priority;

    public PriorityTask(String name, long durationMs, Priority priority) {
        super(name, durationMs, TaskType.CPU_INTENSIVE);
        this.priority = priority;
    }

    public Priority getPriority() { return priority; }

    @Override
    public int compareTo(PriorityTask other) {
        return Integer.compare(other.priority.getValue(), this.priority.getValue());
    }
}

/**
 * Basic consolidated compute unit that executes multiple tasks
 */
class ConsolidatedComputeUnit {
    private final String unitId;
    private final ExecutorService executor;
    private final AtomicInteger tasksCompleted;
    private final AtomicLong totalProcessingTime;

    public ConsolidatedComputeUnit(String unitId, int threads) {
        this.unitId = unitId;
        this.executor = Executors.newFixedThreadPool(threads);
        this.tasksCompleted = new AtomicInteger(0);
        this.totalProcessingTime = new AtomicLong(0);
    }

    public void submitTask(ComputeTask task) {
        executor.submit(() -> {
            try {
                long start = System.currentTimeMillis();
                task.execute();
                long duration = System.currentTimeMillis() - start;
                totalProcessingTime.addAndGet(duration);
                tasksCompleted.incrementAndGet();
                System.out.println("[" + unitId + "] Completed: " + task.getName() + " (" + duration + "ms)");
            } catch (Exception e) {
                System.out.println("[" + unitId + "] Failed: " + task.getName() + " - " + e.getMessage());
            }
        });
    }

    public void printStats() {
        System.out.println("\nStats for " + unitId + ":");
        System.out.println("  Tasks completed: " + tasksCompleted.get());
        System.out.println("  Total processing time: " + totalProcessingTime.get() + "ms");
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Multi-tenant consolidator with per-tenant tracking
 */
class MultiTenantConsolidator {
    private final ExecutorService executor;
    private final Map<String, AtomicInteger> tenantTaskCounts;
    private final Map<String, AtomicLong> tenantProcessingTimes;

    public MultiTenantConsolidator(int threads) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.tenantTaskCounts = new ConcurrentHashMap<>();
        this.tenantProcessingTimes = new ConcurrentHashMap<>();
    }

    public void submitTenantTask(String tenantId, ComputeTask task) {
        tenantTaskCounts.putIfAbsent(tenantId, new AtomicInteger(0));
        tenantProcessingTimes.putIfAbsent(tenantId, new AtomicLong(0));

        executor.submit(() -> {
            try {
                long start = System.currentTimeMillis();
                task.execute();
                long duration = System.currentTimeMillis() - start;

                tenantTaskCounts.get(tenantId).incrementAndGet();
                tenantProcessingTimes.get(tenantId).addAndGet(duration);

                System.out.println("[" + tenantId + "] Completed: " + task.getName());
            } catch (Exception e) {
                System.out.println("[" + tenantId + "] Failed: " + task.getName());
            }
        });
    }

    public void printTenantStats() {
        System.out.println("\nMulti-Tenant Statistics:");
        tenantTaskCounts.forEach((tenant, count) -> {
            long time = tenantProcessingTimes.get(tenant).get();
            System.out.println("  " + tenant + ": " + count.get() + " tasks, " + time + "ms total");
        });
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Priority-based task consolidator
 */
class PriorityConsolidator {
    private final ExecutorService executor;
    private final PriorityBlockingQueue<PriorityTask> taskQueue;
    private final List<String> executionOrder;

    public PriorityConsolidator(int threads) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.taskQueue = new PriorityBlockingQueue<>();
        this.executionOrder = Collections.synchronizedList(new ArrayList<>());
        startProcessing();
    }

    private void startProcessing() {
        for (int i = 0; i < 3; i++) {
            executor.submit(() -> {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        PriorityTask task = taskQueue.poll(100, TimeUnit.MILLISECONDS);
                        if (task != null) {
                            executionOrder.add(task.getName() + "(" + task.getPriority() + ")");
                            task.execute();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } catch (Exception e) {
                        // Task execution failed
                    }
                }
            });
        }
    }

    public void submitTask(PriorityTask task) {
        taskQueue.offer(task);
    }

    public void printExecutionOrder() {
        System.out.println("\nExecution Order (by priority):");
        executionOrder.forEach(task -> System.out.println("  " + task));
    }

    public void shutdown() {
        executor.shutdownNow();
    }
}

/**
 * Resource pool for managing compute resources
 */
class ResourcePool {
    private final BlockingQueue<ComputeResource> availableResources;
    private final AtomicInteger acquisitionCount;

    public ResourcePool(int poolSize, int maxWaitSeconds) {
        this.availableResources = new LinkedBlockingQueue<>();
        this.acquisitionCount = new AtomicInteger(0);

        for (int i = 0; i < poolSize; i++) {
            availableResources.offer(new ComputeResource("Resource-" + i));
        }
    }

    public ComputeResource acquireResource() {
        try {
            ComputeResource resource = availableResources.poll(10, TimeUnit.SECONDS);
            if (resource != null) {
                acquisitionCount.incrementAndGet();
                return resource;
            }
            throw new RuntimeException("Resource acquisition timeout");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Resource acquisition interrupted");
        }
    }

    public void releaseResource(ComputeResource resource) {
        availableResources.offer(resource);
    }

    public void printPoolStats() {
        System.out.println("\nResource Pool Stats:");
        System.out.println("  Available resources: " + availableResources.size());
        System.out.println("  Total acquisitions: " + acquisitionCount.get());
    }

    public void shutdown() {
        availableResources.clear();
    }
}

/**
 * Represents a compute resource
 */
class ComputeResource {
    private final String id;
    private int usageCount = 0;

    public ComputeResource(String id) {
        this.id = id;
    }

    public void execute(String taskName, long durationMs) {
        try {
            usageCount++;
            Thread.sleep(durationMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public String getId() { return id; }
    public int getUsageCount() { return usageCount; }
}

/**
 * Load-balanced consolidator
 */
class LoadBalancedConsolidator {
    private final List<ConsolidatedComputeUnit> units;
    private final AtomicInteger roundRobinIndex;

    public LoadBalancedConsolidator(int unitCount) {
        this.units = new ArrayList<>();
        this.roundRobinIndex = new AtomicInteger(0);

        for (int i = 0; i < unitCount; i++) {
            units.add(new ConsolidatedComputeUnit("Unit-" + i, 2));
        }
    }

    public void submitTask(ComputeTask task) {
        int index = Math.abs(roundRobinIndex.getAndIncrement() % units.size());
        units.get(index).submitTask(task);
    }

    public void printLoadDistribution() {
        System.out.println("\nLoad Distribution:");
        units.forEach(ConsolidatedComputeUnit::printStats);
    }

    public void shutdown() {
        units.forEach(ConsolidatedComputeUnit::shutdown);
    }
}

/**
 * Auto-scaling consolidator
 */
class AutoScalingConsolidator {
    private final List<ConsolidatedComputeUnit> activeUnits;
    private final int minCapacity;
    private final int maxCapacity;
    private final double scaleUpThreshold;
    private final double scaleDownThreshold;
    private final AtomicInteger currentLoad;

    public AutoScalingConsolidator(int minCapacity, int maxCapacity, double scaleUpThreshold, double scaleDownThreshold) {
        this.activeUnits = Collections.synchronizedList(new ArrayList<>());
        this.minCapacity = minCapacity;
        this.maxCapacity = maxCapacity;
        this.scaleUpThreshold = scaleUpThreshold;
        this.scaleDownThreshold = scaleDownThreshold;
        this.currentLoad = new AtomicInteger(0);

        for (int i = 0; i < minCapacity; i++) {
            activeUnits.add(new ConsolidatedComputeUnit("AutoScale-" + i, 2));
        }
    }

    public void submitTask(ComputeTask task) {
        currentLoad.incrementAndGet();
        adjustCapacity();

        int index = currentLoad.get() % activeUnits.size();
        activeUnits.get(index).submitTask(task);

        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(task.getDurationMs());
                currentLoad.decrementAndGet();
                adjustCapacity();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    private void adjustCapacity() {
        double loadRatio = (double) currentLoad.get() / activeUnits.size();

        if (loadRatio > scaleUpThreshold && activeUnits.size() < maxCapacity) {
            int newIndex = activeUnits.size();
            activeUnits.add(new ConsolidatedComputeUnit("AutoScale-" + newIndex, 2));
            System.out.println("Scaled UP to " + activeUnits.size() + " units");
        } else if (loadRatio < scaleDownThreshold && activeUnits.size() > minCapacity) {
            ConsolidatedComputeUnit removed = activeUnits.remove(activeUnits.size() - 1);
            removed.shutdown();
            System.out.println("Scaled DOWN to " + activeUnits.size() + " units");
        }
    }

    public int getCurrentCapacity() {
        return activeUnits.size();
    }

    public void shutdown() {
        activeUnits.forEach(ConsolidatedComputeUnit::shutdown);
    }
}

/**
 * Cost-optimized consolidator with savings tracking
 */
class CostOptimizedConsolidator {
    private final ConsolidatedComputeUnit consolidatedUnit;
    private final double costPerTaskUnconsolidated;
    private final double costPerTaskConsolidated;
    private final AtomicInteger tasksProcessed;

    public CostOptimizedConsolidator(int threads, double costPerTaskConsolidated) {
        this.consolidatedUnit = new ConsolidatedComputeUnit("CostOptimized", threads);
        this.costPerTaskUnconsolidated = 0.10; // $0.10 per task without consolidation
        this.costPerTaskConsolidated = costPerTaskConsolidated; // $0.05 per task with consolidation
        this.tasksProcessed = new AtomicInteger(0);
    }

    public void submitTask(ComputeTask task) {
        tasksProcessed.incrementAndGet();
        consolidatedUnit.submitTask(task);
    }

    public void printCostAnalysis() {
        int tasks = tasksProcessed.get();
        double unconsolidatedCost = tasks * costPerTaskUnconsolidated;
        double consolidatedCost = tasks * costPerTaskConsolidated;
        double savings = unconsolidatedCost - consolidatedCost;
        double savingsPercent = (savings / unconsolidatedCost) * 100;

        System.out.println("\nCost Analysis:");
        System.out.println("  Tasks processed: " + tasks);
        System.out.println("  Unconsolidated cost: $" + String.format("%.2f", unconsolidatedCost));
        System.out.println("  Consolidated cost: $" + String.format("%.2f", consolidatedCost));
        System.out.println("  Savings: $" + String.format("%.2f", savings) +
                         " (" + String.format("%.1f", savingsPercent) + "%)");
    }

    public void shutdown() {
        consolidatedUnit.shutdown();
    }
}

/**
 * Fault-isolated consolidator
 */
class FaultIsolatedConsolidator {
    private final ExecutorService executor;
    private final AtomicInteger successCount;
    private final AtomicInteger failureCount;

    public FaultIsolatedConsolidator(int threads) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.successCount = new AtomicInteger(0);
        this.failureCount = new AtomicInteger(0);
    }

    public void submitTask(ComputeTask task) {
        executor.submit(() -> {
            try {
                task.execute();
                successCount.incrementAndGet();
                System.out.println("[SUCCESS] " + task.getName());
            } catch (Exception e) {
                failureCount.incrementAndGet();
                System.out.println("[FAILURE] " + task.getName() + " - Isolated and contained");
            }
        });
    }

    public void printHealthStats() {
        int total = successCount.get() + failureCount.get();
        double successRate = total > 0 ? (successCount.get() * 100.0 / total) : 0;

        System.out.println("\nFault Isolation Stats:");
        System.out.println("  Successful tasks: " + successCount.get());
        System.out.println("  Failed tasks: " + failureCount.get());
        System.out.println("  Success rate: " + String.format("%.1f", successRate) + "%");
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Monitored consolidator with performance metrics
 */
class MonitoredConsolidator {
    private final ExecutorService executor;
    private final List<Long> taskDurations;
    private final AtomicLong totalThroughput;

    public MonitoredConsolidator(int threads) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.taskDurations = Collections.synchronizedList(new ArrayList<>());
        this.totalThroughput = new AtomicLong(0);
    }

    public void submitTask(ComputeTask task) {
        executor.submit(() -> {
            try {
                long start = System.currentTimeMillis();
                task.execute();
                long duration = System.currentTimeMillis() - start;
                taskDurations.add(duration);
                totalThroughput.incrementAndGet();
            } catch (Exception e) {
                // Handle error
            }
        });
    }

    public void printPerformanceMetrics() {
        if (taskDurations.isEmpty()) return;

        double avgDuration = taskDurations.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);

        long minDuration = taskDurations.stream()
            .mapToLong(Long::longValue)
            .min()
            .orElse(0);

        long maxDuration = taskDurations.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0);

        System.out.println("\nPerformance Metrics:");
        System.out.println("  Tasks completed: " + taskDurations.size());
        System.out.println("  Average duration: " + String.format("%.2f", avgDuration) + "ms");
        System.out.println("  Min duration: " + minDuration + "ms");
        System.out.println("  Max duration: " + maxDuration + "ms");
        System.out.println("  Throughput: " + totalThroughput.get() + " tasks");
    }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Backpressure-aware consolidator
 */
class BackpressureConsolidator {
    private final ExecutorService executor;
    private final Semaphore backpressureSemaphore;
    private final AtomicInteger acceptedTasks;
    private final AtomicInteger rejectedTasks;

    public BackpressureConsolidator(int threads, int maxQueueSize) {
        this.executor = Executors.newFixedThreadPool(threads);
        this.backpressureSemaphore = new Semaphore(maxQueueSize);
        this.acceptedTasks = new AtomicInteger(0);
        this.rejectedTasks = new AtomicInteger(0);
    }

    public boolean trySubmitTask(ComputeTask task) {
        if (backpressureSemaphore.tryAcquire()) {
            acceptedTasks.incrementAndGet();
            executor.submit(() -> {
                try {
                    task.execute();
                } catch (Exception e) {
                    // Handle error
                } finally {
                    backpressureSemaphore.release();
                }
            });
            return true;
        } else {
            rejectedTasks.incrementAndGet();
            return false;
        }
    }

    public void printBackpressureStats() {
        int total = acceptedTasks.get() + rejectedTasks.get();
        double acceptanceRate = total > 0 ? (acceptedTasks.get() * 100.0 / total) : 0;

        System.out.println("\nBackpressure Statistics:");
        System.out.println("  Accepted tasks: " + acceptedTasks.get());
        System.out.println("  Rejected tasks: " + rejectedTasks.get());
        System.out.println("  Acceptance rate: " + String.format("%.1f", acceptanceRate) + "%");
    }

    public void shutdown() {
        executor.shutdown();
    }
}
