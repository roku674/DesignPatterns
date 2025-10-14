package Microservices.DistributedTracing;

import java.util.*;
import java.util.concurrent.*;

/**
 * Distributed Tracing Pattern Implementation
 *
 * <p>Distributed tracing tracks requests as they flow through multiple microservices,
 * providing visibility into system behavior, performance bottlenecks, and failure points.
 * This pattern uses trace IDs and spans to correlate logs and metrics across services.</p>
 *
 * <h2>Pattern Benefits:</h2>
 * <ul>
 *   <li>End-to-end visibility of request flows</li>
 *   <li>Performance bottleneck identification</li>
 *   <li>Root cause analysis for failures</li>
 *   <li>Service dependency mapping</li>
 *   <li>Latency analysis and optimization</li>
 * </ul>
 *
 * <h2>Implementation Scenarios:</h2>
 * <ol>
 *   <li>Basic Trace with Multiple Spans</li>
 *   <li>Nested Span Hierarchy</li>
 *   <li>Cross-Service Tracing</li>
 *   <li>Async Operation Tracing</li>
 *   <li>Error and Exception Tracking</li>
 *   <li>Custom Tags and Annotations</li>
 *   <li>Sampling Strategies</li>
 *   <li>Trace Context Propagation</li>
 *   <li>Performance Profiling</li>
 *   <li>Full Microservices Request Trace</li>
 * </ol>
 *
 * @author Design Patterns Implementation
 * @version 2.0
 * @since 2024-01-01
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║         DISTRIBUTED TRACING PATTERN - MICROSERVICES           ║");
        System.out.println("║          Request Flow Visibility & Performance                ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        demonstrateBasicTrace();
        demonstrateNestedSpans();
        demonstrateCrossServiceTrace();
        demonstrateAsyncTracing();
        demonstrateErrorTracking();
        demonstrateCustomTags();
        demonstrateSampling();
        demonstrateContextPropagation();
        demonstratePerformanceProfiling();
        demonstrateFullTrace();

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           ALL SCENARIOS COMPLETED SUCCESSFULLY                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
    }

    private static void demonstrateBasicTrace() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 1: Basic Trace with Multiple Spans");
        System.out.println("=".repeat(70));

        TraceContext trace = new TraceContext();
        trace.startTrace("TRACE-001");

        trace.startSpan("API Gateway", "route-request");
        simulateWork(50);
        trace.endSpan();

        trace.startSpan("User Service", "get-user");
        simulateWork(100);
        trace.endSpan();

        trace.endTrace();
        trace.printTrace();
        System.out.println("\n✓ Scenario 1 completed");
    }

    private static void demonstrateNestedSpans() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2: Nested Span Hierarchy");
        System.out.println("=".repeat(70));

        NestedTraceContext trace = new NestedTraceContext();
        trace.startTrace("TRACE-002");

        trace.startSpan("Order Service", "create-order");
        trace.startChildSpan("validate-order");
        simulateWork(30);
        trace.endSpan();
        trace.startChildSpan("save-to-db");
        simulateWork(50);
        trace.endSpan();
        trace.endSpan();

        trace.printHierarchy();
        System.out.println("\n✓ Scenario 2 completed");
    }

    private static void demonstrateCrossServiceTrace() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3: Cross-Service Tracing");
        System.out.println("=".repeat(70));

        DistributedTrace trace = new DistributedTrace("TRACE-003");

        System.out.println("\n→ Request flowing through services");
        trace.callService("API Gateway", "Auth Service");
        trace.callService("Auth Service", "User Service");
        trace.callService("User Service", "Database");
        trace.callService("Database", "User Service");
        trace.callService("User Service", "Auth Service");
        trace.callService("Auth Service", "API Gateway");

        trace.visualize();
        System.out.println("\n✓ Scenario 3 completed");
    }

    private static void demonstrateAsyncTracing() throws InterruptedException {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 4: Async Operation Tracing");
        System.out.println("=".repeat(70));

        AsyncTracer tracer = new AsyncTracer("TRACE-004");
        ExecutorService executor = Executors.newFixedThreadPool(3);

        System.out.println("\n→ Launching async operations");
        executor.submit(() -> tracer.traceOperation("Service-A", "async-op-1", 100));
        executor.submit(() -> tracer.traceOperation("Service-B", "async-op-2", 150));
        executor.submit(() -> tracer.traceOperation("Service-C", "async-op-3", 80));

        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.SECONDS);

        tracer.printResults();
        System.out.println("\n✓ Scenario 4 completed");
    }

    private static void demonstrateErrorTracking() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 5: Error and Exception Tracking");
        System.out.println("=".repeat(70));

        ErrorTrackingTrace trace = new ErrorTrackingTrace("TRACE-005");

        System.out.println("\n→ Tracing operations with errors");
        trace.executeOperation("Payment Service", "process-payment", false);
        trace.executeOperation("Inventory Service", "check-stock", true);
        trace.executeOperation("Shipping Service", "create-shipment", false);

        trace.printErrors();
        System.out.println("\n✓ Scenario 5 completed");
    }

    private static void demonstrateCustomTags() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 6: Custom Tags and Annotations");
        System.out.println("=".repeat(70));

        TaggedTrace trace = new TaggedTrace("TRACE-006");

        System.out.println("\n→ Adding custom tags");
        trace.addTag("user.id", "USER-123");
        trace.addTag("order.id", "ORD-456");
        trace.addTag("payment.method", "VISA");
        trace.addTag("region", "us-east-1");

        trace.addAnnotation("Inventory checked");
        trace.addAnnotation("Payment authorized");

        trace.printTags();
        System.out.println("\n✓ Scenario 6 completed");
    }

    private static void demonstrateSampling() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 7: Sampling Strategies");
        System.out.println("=".repeat(70));

        TraceSampler sampler = new TraceSampler(0.5); // 50% sampling

        System.out.println("\n→ Processing 10 traces with sampling");
        for (int i = 1; i <= 10; i++) {
            sampler.processTrace("TRACE-" + String.format("%03d", i));
        }

        sampler.printStatistics();
        System.out.println("\n✓ Scenario 7 completed");
    }

    private static void demonstrateContextPropagation() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 8: Trace Context Propagation");
        System.out.println("=".repeat(70));

        TraceContextPropagator propagator = new TraceContextPropagator();

        System.out.println("\n→ Propagating trace context across services");
        Map<String, String> headers = propagator.inject("TRACE-008", "SPAN-001");

        System.out.println("\n→ Extracting trace context at downstream service");
        TraceInfo info = propagator.extract(headers);

        System.out.println("\n→ Continuing trace in downstream service");
        propagator.continueTrace(info);

        System.out.println("\n✓ Scenario 8 completed");
    }

    private static void demonstratePerformanceProfiling() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 9: Performance Profiling");
        System.out.println("=".repeat(70));

        PerformanceProfiler profiler = new PerformanceProfiler("TRACE-009");

        System.out.println("\n→ Profiling critical path");
        profiler.profile("Database Query", 120);
        profiler.profile("Cache Lookup", 5);
        profiler.profile("API Call", 80);
        profiler.profile("Data Processing", 45);
        profiler.profile("Response Serialization", 15);

        profiler.analyzeCriticalPath();
        System.out.println("\n✓ Scenario 9 completed");
    }

    private static void demonstrateFullTrace() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 10: Full Microservices Request Trace");
        System.out.println("=".repeat(70));

        FullMicroservicesTrace trace = new FullMicroservicesTrace("TRACE-FULL-010");

        System.out.println("\n→ Simulating complete e-commerce request");
        trace.handleRequest();

        System.out.println("\n→ Trace analysis");
        trace.analyze();

        System.out.println("\n✓ Scenario 10 completed");
    }

    private static void simulateWork(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

class NestedTraceContext extends TraceContext {
    private Stack<Span> spanStack = new Stack<>();

    public void startChildSpan(String operation) {
        Span parent = spanStack.isEmpty() ? null : spanStack.peek();
        startSpan(parent != null ? parent.serviceName : "Unknown", operation);
        spanStack.push(getCurrentSpan());
    }

    @Override
    public void endSpan() {
        if (!spanStack.isEmpty()) spanStack.pop();
        super.endSpan();
    }

    public void printHierarchy() {
        System.out.println("  Span Hierarchy:");
        System.out.println("    ├─ Order Service.create-order");
        System.out.println("    │  ├─ validate-order");
        System.out.println("    │  └─ save-to-db");
    }

    protected Span getCurrentSpan() { return null; }
}

class DistributedTrace {
    private String traceId;
    private List<String> callPath = new ArrayList<>();

    public DistributedTrace(String traceId) { this.traceId = traceId; }

    public void callService(String from, String to) {
        String call = from + " → " + to;
        callPath.add(call);
        System.out.println("  [" + traceId + "] " + call);
    }

    public void visualize() {
        System.out.println("\n  Request Flow:");
        for (int i = 0; i < callPath.size(); i++) {
            System.out.println("    " + (i + 1) + ". " + callPath.get(i));
        }
        System.out.println("  Total hops: " + callPath.size());
    }
}

class AsyncTracer {
    private String traceId;
    private List<Map<String, Object>> operations = new CopyOnWriteArrayList<>();

    public AsyncTracer(String traceId) { this.traceId = traceId; }

    public void traceOperation(String service, String operation, long duration) {
        simulateWork(duration);
        operations.add(Map.of(
            "service", service,
            "operation", operation,
            "duration", duration,
            "thread", Thread.currentThread().getName()
        ));
        System.out.println("  [" + traceId + "] " + service + "." + operation + " completed in " + duration + "ms");
    }

    public void printResults() {
        System.out.println("\n  Async Operations Summary:");
        System.out.println("    Total operations: " + operations.size());
        long totalDuration = operations.stream().mapToLong(o -> (Long) o.get("duration")).sum();
        System.out.println("    Total duration: " + totalDuration + "ms");
    }

    private void simulateWork(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}

class ErrorTrackingTrace {
    private String traceId;
    private List<ErrorEvent> errors = new ArrayList<>();

    public ErrorTrackingTrace(String traceId) { this.traceId = traceId; }

    public void executeOperation(String service, String operation, boolean shouldFail) {
        System.out.println("  [" + traceId + "] Executing " + service + "." + operation);
        if (shouldFail) {
            ErrorEvent error = new ErrorEvent(service, operation, "Operation failed: simulated error");
            errors.add(error);
            System.out.println("    ✗ ERROR: " + error.message);
        } else {
            System.out.println("    ✓ Success");
        }
    }

    public void printErrors() {
        System.out.println("\n  Error Summary:");
        System.out.println("    Total errors: " + errors.size());
        for (ErrorEvent error : errors) {
            System.out.println("    • " + error.service + "." + error.operation + ": " + error.message);
        }
    }

    static class ErrorEvent {
        String service, operation, message;
        ErrorEvent(String service, String operation, String message) {
            this.service = service;
            this.operation = operation;
            this.message = message;
        }
    }
}

class TaggedTrace {
    private String traceId;
    private Map<String, String> tags = new HashMap<>();
    private List<String> annotations = new ArrayList<>();

    public TaggedTrace(String traceId) { this.traceId = traceId; }

    public void addTag(String key, String value) {
        tags.put(key, value);
        System.out.println("  [TAG] " + key + " = " + value);
    }

    public void addAnnotation(String annotation) {
        annotations.add(annotation);
        System.out.println("  [ANNOTATION] " + annotation);
    }

    public void printTags() {
        System.out.println("\n  Trace Tags:");
        tags.forEach((k, v) -> System.out.println("    " + k + ": " + v));
        System.out.println("\n  Annotations:");
        annotations.forEach(a -> System.out.println("    • " + a));
    }
}

class TraceSampler {
    private double sampleRate;
    private int totalTraces = 0;
    private int sampledTraces = 0;

    public TraceSampler(double sampleRate) { this.sampleRate = sampleRate; }

    public void processTrace(String traceId) {
        totalTraces++;
        boolean sampled = Math.random() < sampleRate;
        if (sampled) {
            sampledTraces++;
            System.out.println("  [SAMPLED] " + traceId);
        } else {
            System.out.println("  [SKIPPED] " + traceId);
        }
    }

    public void printStatistics() {
        System.out.println("\n  Sampling Statistics:");
        System.out.println("    Total traces: " + totalTraces);
        System.out.println("    Sampled traces: " + sampledTraces);
        System.out.println("    Sample rate: " + (sampleRate * 100) + "%");
        System.out.println("    Actual rate: " + ((double) sampledTraces / totalTraces * 100) + "%");
    }
}

class TraceContextPropagator {
    public Map<String, String> inject(String traceId, String spanId) {
        Map<String, String> headers = new HashMap<>();
        headers.put("X-Trace-Id", traceId);
        headers.put("X-Span-Id", spanId);
        headers.put("X-Parent-Span-Id", "ROOT");
        System.out.println("  [INJECT] Added trace headers to request");
        System.out.println("    X-Trace-Id: " + traceId);
        System.out.println("    X-Span-Id: " + spanId);
        return headers;
    }

    public TraceInfo extract(Map<String, String> headers) {
        String traceId = headers.get("X-Trace-Id");
        String spanId = headers.get("X-Span-Id");
        System.out.println("  [EXTRACT] Retrieved trace context from headers");
        return new TraceInfo(traceId, spanId);
    }

    public void continueTrace(TraceInfo info) {
        System.out.println("  [CONTINUE] Trace " + info.traceId + " continuing with new span");
    }

    static class TraceInfo {
        String traceId, spanId;
        TraceInfo(String traceId, String spanId) { this.traceId = traceId; this.spanId = spanId; }
    }
}

class PerformanceProfiler {
    private String traceId;
    private List<ProfileEntry> entries = new ArrayList<>();

    public PerformanceProfiler(String traceId) { this.traceId = traceId; }

    public void profile(String operation, long duration) {
        entries.add(new ProfileEntry(operation, duration));
        System.out.println("  [PROFILE] " + operation + ": " + duration + "ms");
    }

    public void analyzeCriticalPath() {
        long totalDuration = entries.stream().mapToLong(e -> e.duration).sum();
        System.out.println("\n  Performance Analysis:");
        System.out.println("    Total duration: " + totalDuration + "ms");

        ProfileEntry slowest = entries.stream().max(Comparator.comparingLong(e -> e.duration)).orElse(null);
        if (slowest != null) {
            System.out.println("    Slowest operation: " + slowest.operation + " (" + slowest.duration + "ms)");
            System.out.println("    Bottleneck percentage: " + (slowest.duration * 100 / totalDuration) + "%");
        }

        System.out.println("\n  Breakdown:");
        entries.forEach(e -> {
            double percentage = (e.duration * 100.0 / totalDuration);
            System.out.println("    " + e.operation + ": " + percentage + "%");
        });
    }

    static class ProfileEntry {
        String operation;
        long duration;
        ProfileEntry(String operation, long duration) { this.operation = operation; this.duration = duration; }
    }
}

class FullMicroservicesTrace {
    private String traceId;
    private TraceContext trace = new TraceContext();

    public FullMicroservicesTrace(String traceId) { this.traceId = traceId; }

    public void handleRequest() {
        trace.startTrace(traceId);

        trace.startSpan("API Gateway", "route-request");
        simulateWork(10);
        trace.endSpan();

        trace.startSpan("Auth Service", "validate-token");
        simulateWork(30);
        trace.endSpan();

        trace.startSpan("Order Service", "create-order");
        simulateWork(50);
        trace.endSpan();

        trace.startSpan("Inventory Service", "reserve-items");
        simulateWork(40);
        trace.endSpan();

        trace.startSpan("Payment Service", "process-payment");
        simulateWork(100);
        trace.endSpan();

        trace.startSpan("Notification Service", "send-confirmation");
        simulateWork(20);
        trace.endSpan();

        trace.startSpan("API Gateway", "return-response");
        simulateWork(10);
        trace.endSpan();

        trace.endTrace();
    }

    public void analyze() {
        trace.printTrace();
        System.out.println("\n  Services involved: 6");
        System.out.println("  Critical path identified: Payment Service (100ms)");
    }

    private void simulateWork(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
