package Cloud.Ambassador;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Duration;
import java.time.Instant;

/**
 * Ambassador Pattern Demonstration
 *
 * The Ambassador pattern creates helper services that send network requests on behalf of consumers.
 * It acts as an out-of-process proxy that is co-located with the client.
 *
 * Key Concepts:
 * - Client-side proxy: Handles cross-cutting concerns
 * - Retry logic: Automatic retries on failure
 * - Circuit breaking: Prevents cascading failures
 * - Logging and monitoring: Centralizes observability
 * - Connection pooling: Manages resource efficiency
 *
 * This implementation demonstrates:
 * 1. Basic request proxying with retry
 * 2. Circuit breaker integration
 * 3. Request/response logging
 * 4. Connection pooling
 * 5. Timeout management
 * 6. Metrics collection
 * 7. Load balancing across endpoints
 * 8. Request transformation and enrichment
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Ambassador Pattern Demo ===\n");

        // Scenario 1: Basic Ambassador with Retry
        demonstrateBasicAmbassador();

        // Scenario 2: Ambassador with Circuit Breaker
        demonstrateCircuitBreaker();

        // Scenario 3: Request Logging and Monitoring
        demonstrateLogging();

        // Scenario 4: Connection Pooling
        demonstrateConnectionPooling();

        // Scenario 5: Timeout Management
        demonstrateTimeoutHandling();

        // Scenario 6: Metrics Collection
        demonstrateMetricsCollection();

        // Scenario 7: Load Balancing
        demonstrateLoadBalancing();

        // Scenario 8: Request Enrichment
        demonstrateRequestEnrichment();

        System.out.println("\n=== All Ambassador Scenarios Completed ===");
    }

    /**
     * Scenario 1: Basic Ambassador with Retry
     * Demonstrates automatic retry logic
     */
    private static void demonstrateBasicAmbassador() throws Exception {
        System.out.println("--- Scenario 1: Basic Ambassador with Retry ---");

        RetryAmbassador ambassador = new RetryAmbassador(3);

        System.out.println("Making requests through ambassador...");

        // Successful request
        CompletableFuture<String> success = ambassador.sendRequest("https://api.example.com/data");
        System.out.println("  Result: " + success.get());

        // Failing request (will retry)
        CompletableFuture<String> retry = ambassador.sendRequest("https://api.example.com/unstable");
        try {
            System.out.println("  Result: " + retry.get());
        } catch (Exception e) {
            System.out.println("  Failed after retries: " + e.getMessage());
        }

        System.out.println();
    }

    /**
     * Scenario 2: Circuit Breaker Integration
     * Prevents repeated calls to failing services
     */
    private static void demonstrateCircuitBreaker() throws Exception {
        System.out.println("--- Scenario 2: Ambassador with Circuit Breaker ---");

        CircuitBreakerAmbassador ambassador = new CircuitBreakerAmbassador(3, Duration.ofSeconds(5));

        System.out.println("Making requests with circuit breaker...");

        for (int i = 0; i < 8; i++) {
            int requestId = i;
            CompletableFuture<String> future = ambassador.sendRequest("https://api.example.com/failing");

            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    System.out.println("  Request-" + requestId + ": " + ex.getMessage());
                } else {
                    System.out.println("  Request-" + requestId + ": " + result);
                }
            });

            Thread.sleep(100);
        }

        Thread.sleep(1000);
        System.out.println();
    }

    /**
     * Scenario 3: Request Logging
     * Centralizes logging for all requests
     */
    private static void demonstrateLogging() throws Exception {
        System.out.println("--- Scenario 3: Request Logging and Monitoring ---");

        LoggingAmbassador ambassador = new LoggingAmbassador();

        System.out.println("Making logged requests...");

        List<CompletableFuture<String>> futures = Arrays.asList(
            ambassador.sendRequest("GET", "/users"),
            ambassador.sendRequest("POST", "/orders"),
            ambassador.sendRequest("PUT", "/products/123")
        );

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        System.out.println("\nRequest log:");
        ambassador.getRequestLog().forEach(System.out::println);

        System.out.println();
    }

    /**
     * Scenario 4: Connection Pooling
     * Manages connection resources efficiently
     */
    private static void demonstrateConnectionPooling() throws Exception {
        System.out.println("--- Scenario 4: Connection Pooling ---");

        ConnectionPoolAmbassador ambassador = new ConnectionPoolAmbassador(5);

        System.out.println("Making concurrent requests (5 connection pool)...");

        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            int reqId = i;
            CompletableFuture<String> future = ambassador.sendRequest("https://api.example.com/data-" + reqId);
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        futures.forEach(f -> {
            try {
                System.out.println("  " + f.get());
            } catch (Exception e) {
                System.out.println("  Failed: " + e.getMessage());
            }
        });

        System.out.println("Pool stats: " + ambassador.getPoolStats());
        ambassador.shutdown();
        System.out.println();
    }

    /**
     * Scenario 5: Timeout Management
     * Handles request timeouts gracefully
     */
    private static void demonstrateTimeoutHandling() throws Exception {
        System.out.println("--- Scenario 5: Timeout Management ---");

        TimeoutAmbassador ambassador = new TimeoutAmbassador(Duration.ofMillis(500));

        System.out.println("Making requests with timeout...");

        // Fast request
        CompletableFuture<String> fast = ambassador.sendRequest("https://api.example.com/fast");
        System.out.println("  Fast request: " + fast.get());

        // Slow request (will timeout)
        CompletableFuture<String> slow = ambassador.sendRequest("https://api.example.com/slow");
        try {
            System.out.println("  Slow request: " + slow.get());
        } catch (Exception e) {
            System.out.println("  Slow request timed out: " + e.getCause().getMessage());
        }

        System.out.println();
    }

    /**
     * Scenario 6: Metrics Collection
     * Collects performance metrics
     */
    private static void demonstrateMetricsCollection() throws Exception {
        System.out.println("--- Scenario 6: Metrics Collection ---");

        MetricsAmbassador ambassador = new MetricsAmbassador();

        System.out.println("Making requests and collecting metrics...");

        for (int i = 0; i < 20; i++) {
            ambassador.sendRequest("https://api.example.com/endpoint-" + (i % 3)).get();
        }

        System.out.println("\nMetrics:");
        AmbassadorMetrics metrics = ambassador.getMetrics();
        System.out.println("  Total requests: " + metrics.getTotalRequests());
        System.out.println("  Successful: " + metrics.getSuccessCount());
        System.out.println("  Failed: " + metrics.getFailureCount());
        System.out.println("  Average latency: " + metrics.getAverageLatency() + "ms");
        System.out.println();
    }

    /**
     * Scenario 7: Load Balancing
     * Distributes requests across multiple endpoints
     */
    private static void demonstrateLoadBalancing() throws Exception {
        System.out.println("--- Scenario 7: Load Balancing ---");

        List<String> endpoints = Arrays.asList(
            "https://api1.example.com",
            "https://api2.example.com",
            "https://api3.example.com"
        );

        LoadBalancingAmbassador ambassador = new LoadBalancingAmbassador(endpoints);

        System.out.println("Distributing requests across endpoints...");

        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (int i = 0; i < 9; i++) {
            CompletableFuture<String> future = ambassador.sendRequest("/data");
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        futures.forEach(f -> {
            try {
                System.out.println("  " + f.get());
            } catch (Exception e) {
                System.out.println("  Failed: " + e.getMessage());
            }
        });

        System.out.println("\nEndpoint usage: " + ambassador.getEndpointStats());
        System.out.println();
    }

    /**
     * Scenario 8: Request Enrichment
     * Adds headers, authentication, and transforms requests
     */
    private static void demonstrateRequestEnrichment() throws Exception {
        System.out.println("--- Scenario 8: Request Enrichment ---");

        EnrichmentAmbassador ambassador = new EnrichmentAmbassador("Bearer token123");

        System.out.println("Making enriched requests...");

        List<CompletableFuture<String>> futures = Arrays.asList(
            ambassador.sendRequest("GET", "/users", null),
            ambassador.sendRequest("POST", "/orders", "{\"item\":\"laptop\"}"),
            ambassador.sendRequest("DELETE", "/cache", null)
        );

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        futures.forEach(f -> {
            try {
                System.out.println("  " + f.get());
            } catch (Exception e) {
                System.out.println("  Failed: " + e.getMessage());
            }
        });

        System.out.println();
    }
}

/**
 * Basic ambassador with retry logic
 */
class RetryAmbassador {
    private final int maxRetries;
    private final ExecutorService executor;

    public RetryAmbassador(int maxRetries) {
        this.maxRetries = maxRetries;
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<String> sendRequest(String url) {
        return CompletableFuture.supplyAsync(() -> {
            int attempts = 0;
            Exception lastException = null;

            while (attempts < maxRetries) {
                try {
                    return makeRequest(url);
                } catch (Exception e) {
                    lastException = e;
                    attempts++;
                    if (attempts < maxRetries) {
                        try {
                            Thread.sleep(100 * attempts);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }

            throw new CompletionException("Failed after " + attempts + " attempts", lastException);
        }, executor);
    }

    private String makeRequest(String url) throws Exception {
        if (url.contains("unstable") && Math.random() < 0.8) {
            throw new Exception("Service temporarily unavailable");
        }
        return "Response from " + url;
    }
}

/**
 * Ambassador with circuit breaker
 */
class CircuitBreakerAmbassador {
    private final int failureThreshold;
    private final Duration resetTimeout;
    private final AtomicInteger failureCount;
    private volatile Instant lastFailureTime;
    private volatile boolean circuitOpen;

    public CircuitBreakerAmbassador(int failureThreshold, Duration resetTimeout) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failureCount = new AtomicInteger(0);
        this.circuitOpen = false;
    }

    public CompletableFuture<String> sendRequest(String url) {
        return CompletableFuture.supplyAsync(() -> {
            if (circuitOpen) {
                if (Duration.between(lastFailureTime, Instant.now()).compareTo(resetTimeout) > 0) {
                    circuitOpen = false;
                    failureCount.set(0);
                } else {
                    throw new CompletionException(new Exception("Circuit breaker is OPEN"));
                }
            }

            try {
                String response = makeRequest(url);
                failureCount.set(0);
                return response;
            } catch (Exception e) {
                int failures = failureCount.incrementAndGet();
                lastFailureTime = Instant.now();

                if (failures >= failureThreshold) {
                    circuitOpen = true;
                }

                throw new CompletionException(e);
            }
        });
    }

    private String makeRequest(String url) throws Exception {
        if (url.contains("failing")) {
            throw new Exception("Service failure");
        }
        return "Response from " + url;
    }
}

/**
 * Ambassador with request logging
 */
class LoggingAmbassador {
    private final List<String> requestLog;
    private final ExecutorService executor;

    public LoggingAmbassador() {
        this.requestLog = new CopyOnWriteArrayList<>();
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<String> sendRequest(String method, String path) {
        return CompletableFuture.supplyAsync(() -> {
            long start = System.currentTimeMillis();
            String logEntry = "";

            try {
                String response = makeRequest(method, path);
                long duration = System.currentTimeMillis() - start;
                logEntry = String.format("[%s %s] SUCCESS (%dms)", method, path, duration);
                requestLog.add(logEntry);
                return response;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - start;
                logEntry = String.format("[%s %s] FAILED (%dms): %s", method, path, duration, e.getMessage());
                requestLog.add(logEntry);
                throw new CompletionException(e);
            }
        }, executor);
    }

    private String makeRequest(String method, String path) {
        return method + " " + path + " -> OK";
    }

    public List<String> getRequestLog() {
        return new ArrayList<>(requestLog);
    }
}

/**
 * Ambassador with connection pooling
 */
class ConnectionPoolAmbassador {
    private final BlockingQueue<Connection> pool;
    private final AtomicInteger totalRequests;
    private final AtomicInteger poolWaits;

    public ConnectionPoolAmbassador(int poolSize) {
        this.pool = new LinkedBlockingQueue<>();
        this.totalRequests = new AtomicInteger(0);
        this.poolWaits = new AtomicInteger(0);

        for (int i = 0; i < poolSize; i++) {
            pool.offer(new Connection("CONN-" + i));
        }
    }

    public CompletableFuture<String> sendRequest(String url) {
        return CompletableFuture.supplyAsync(() -> {
            totalRequests.incrementAndGet();
            Connection conn = null;

            try {
                conn = pool.poll(1, TimeUnit.SECONDS);
                if (conn == null) {
                    poolWaits.incrementAndGet();
                    throw new Exception("Connection pool exhausted");
                }

                Thread.sleep(50);
                return "Response via " + conn.getId() + " from " + url;
            } catch (Exception e) {
                throw new CompletionException(e);
            } finally {
                if (conn != null) {
                    pool.offer(conn);
                }
            }
        });
    }

    public String getPoolStats() {
        return String.format("Total: %d, Waits: %d, Available: %d",
            totalRequests.get(), poolWaits.get(), pool.size());
    }

    public void shutdown() {
        // Cleanup resources
    }

    static class Connection {
        private final String id;

        Connection(String id) {
            this.id = id;
        }

        String getId() {
            return id;
        }
    }
}

/**
 * Ambassador with timeout management
 */
class TimeoutAmbassador {
    private final Duration timeout;
    private final ExecutorService executor;

    public TimeoutAmbassador(Duration timeout) {
        this.timeout = timeout;
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<String> sendRequest(String url) {
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            try {
                return makeRequest(url);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);

        return future.orTimeout(timeout.toMillis(), TimeUnit.MILLISECONDS);
    }

    private String makeRequest(String url) throws Exception {
        if (url.contains("slow")) {
            Thread.sleep(2000);
        } else {
            Thread.sleep(100);
        }
        return "Response from " + url;
    }
}

/**
 * Ambassador with metrics collection
 */
class MetricsAmbassador {
    private final AmbassadorMetrics metrics;
    private final ExecutorService executor;

    public MetricsAmbassador() {
        this.metrics = new AmbassadorMetrics();
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<String> sendRequest(String url) {
        return CompletableFuture.supplyAsync(() -> {
            metrics.incrementTotal();
            long start = System.currentTimeMillis();

            try {
                String response = makeRequest(url);
                long latency = System.currentTimeMillis() - start;
                metrics.recordSuccess(latency);
                return response;
            } catch (Exception e) {
                metrics.incrementFailure();
                throw new CompletionException(e);
            }
        }, executor);
    }

    private String makeRequest(String url) throws Exception {
        Thread.sleep(10 + new Random().nextInt(90));
        if (Math.random() < 0.1) {
            throw new Exception("Random failure");
        }
        return "Response from " + url;
    }

    public AmbassadorMetrics getMetrics() {
        return metrics;
    }
}

/**
 * Metrics tracker for ambassador
 */
class AmbassadorMetrics {
    private final AtomicInteger totalRequests = new AtomicInteger(0);
    private final AtomicInteger successCount = new AtomicInteger(0);
    private final AtomicInteger failureCount = new AtomicInteger(0);
    private final List<Long> latencies = new CopyOnWriteArrayList<>();

    public void incrementTotal() {
        totalRequests.incrementAndGet();
    }

    public void recordSuccess(long latency) {
        successCount.incrementAndGet();
        latencies.add(latency);
    }

    public void incrementFailure() {
        failureCount.incrementAndGet();
    }

    public int getTotalRequests() {
        return totalRequests.get();
    }

    public int getSuccessCount() {
        return successCount.get();
    }

    public int getFailureCount() {
        return failureCount.get();
    }

    public long getAverageLatency() {
        return latencies.isEmpty() ? 0 :
            latencies.stream().mapToLong(Long::longValue).sum() / latencies.size();
    }
}

/**
 * Load balancing ambassador
 */
class LoadBalancingAmbassador {
    private final List<String> endpoints;
    private final AtomicInteger roundRobinIndex;
    private final Map<String, AtomicInteger> endpointCounts;
    private final ExecutorService executor;

    public LoadBalancingAmbassador(List<String> endpoints) {
        this.endpoints = new ArrayList<>(endpoints);
        this.roundRobinIndex = new AtomicInteger(0);
        this.endpointCounts = new ConcurrentHashMap<>();
        this.executor = Executors.newFixedThreadPool(10);

        endpoints.forEach(ep -> endpointCounts.put(ep, new AtomicInteger(0)));
    }

    public CompletableFuture<String> sendRequest(String path) {
        return CompletableFuture.supplyAsync(() -> {
            String endpoint = selectEndpoint();
            endpointCounts.get(endpoint).incrementAndGet();

            try {
                Thread.sleep(50);
                return "Response from " + endpoint + path;
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);
    }

    private String selectEndpoint() {
        int index = roundRobinIndex.getAndIncrement() % endpoints.size();
        return endpoints.get(index);
    }

    public Map<String, Integer> getEndpointStats() {
        Map<String, Integer> stats = new HashMap<>();
        endpointCounts.forEach((ep, count) -> stats.put(ep, count.get()));
        return stats;
    }
}

/**
 * Request enrichment ambassador
 */
class EnrichmentAmbassador {
    private final String authToken;
    private final ExecutorService executor;

    public EnrichmentAmbassador(String authToken) {
        this.authToken = authToken;
        this.executor = Executors.newFixedThreadPool(10);
    }

    public CompletableFuture<String> sendRequest(String method, String path, String body) {
        return CompletableFuture.supplyAsync(() -> {
            EnrichedRequest request = enrichRequest(method, path, body);

            try {
                Thread.sleep(50);
                return makeRequest(request);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);
    }

    private EnrichedRequest enrichRequest(String method, String path, String body) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", authToken);
        headers.put("X-Request-ID", UUID.randomUUID().toString());
        headers.put("X-Timestamp", Instant.now().toString());
        headers.put("User-Agent", "Ambassador/1.0");

        return new EnrichedRequest(method, path, headers, body);
    }

    private String makeRequest(EnrichedRequest request) {
        return String.format("Enriched %s %s [RequestID: %s]",
            request.method, request.path, request.headers.get("X-Request-ID"));
    }

    static class EnrichedRequest {
        final String method;
        final String path;
        final Map<String, String> headers;
        final String body;

        EnrichedRequest(String method, String path, Map<String, String> headers, String body) {
            this.method = method;
            this.path = path;
            this.headers = headers;
            this.body = body;
        }
    }
}
