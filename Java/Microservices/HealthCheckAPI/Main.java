package Microservices.HealthCheckAPI;

import java.util.*;
import java.time.LocalDateTime;
import java.time.Duration;

/**
 * Health Check API Pattern - Main Demonstration
 *
 * Purpose:
 * The Health Check API pattern provides a standardized endpoint that returns the health
 * status of a service and its dependencies. This enables monitoring systems, load balancers,
 * and orchestration platforms to detect and respond to service failures.
 *
 * Key Components:
 * - ServiceHealth: Aggregates health checks from multiple components
 * - HealthCheck: Interface for individual component health checks
 * - HealthStatus: Represents the overall health state
 * - HealthEndpoint: HTTP endpoint exposing health information
 *
 * Microservices Architecture Benefits:
 * - Automated failure detection and recovery
 * - Load balancer integration for traffic routing
 * - Container orchestration (Kubernetes liveness/readiness probes)
 * - Monitoring and alerting integration
 * - Graceful degradation support
 *
 * Real-World Use Cases:
 * 1. Kubernetes readiness probes to prevent traffic to unhealthy pods
 * 2. Load balancer health checks to remove failing instances
 * 3. Circuit breaker pattern integration
 * 4. Monitoring dashboard status aggregation
 * 5. Automated incident response triggering
 *
 * Best Practices:
 * - Keep health checks lightweight and fast (< 1 second)
 * - Check all critical dependencies (database, cache, external APIs)
 * - Use timeouts to prevent hanging health checks
 * - Return appropriate HTTP status codes (200 OK, 503 Service Unavailable)
 * - Include detailed diagnostics in DOWN state
 * - Cache health check results briefly to prevent overhead
 *
 * @author Design Patterns Implementation
 * @version 2.0
 */
public class Main {

    /**
     * Main entry point demonstrating comprehensive Health Check API scenarios.
     *
     * Scenarios demonstrated:
     * 1. Basic health check with multiple dependencies
     * 2. Degraded service health (partial failures)
     * 3. Complete service failure
     * 4. Health check with timeout handling
     * 5. Cascading health checks across services
     * 6. Health check aggregation for microservices mesh
     * 7. Kubernetes-style liveness and readiness probes
     * 8. Health check with auto-recovery
     * 9. Health metrics and SLA tracking
     * 10. Circuit breaker integration with health checks
     *
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        System.out.println("=".repeat(80));
        System.out.println("HEALTH CHECK API PATTERN - MICROSERVICES DEMONSTRATION");
        System.out.println("=".repeat(80));
        System.out.println();

        // Scenario 1: Basic Health Check
        demonstrateBasicHealthCheck();

        // Scenario 2: Degraded Service Health
        demonstrateDegradedHealth();

        // Scenario 3: Complete Service Failure
        demonstrateServiceFailure();

        // Scenario 4: Health Check with Timeouts
        demonstrateHealthCheckTimeouts();

        // Scenario 5: Cascading Health Checks
        demonstrateCascadingHealthChecks();

        // Scenario 6: Microservices Mesh Health Aggregation
        demonstrateMicroservicesMeshHealth();

        // Scenario 7: Kubernetes-Style Probes
        demonstrateKubernetesProbes();

        // Scenario 8: Auto-Recovery Health Monitoring
        demonstrateAutoRecovery();

        // Scenario 9: Health Metrics and SLA Tracking
        demonstrateHealthMetrics();

        // Scenario 10: Circuit Breaker Integration
        demonstrateCircuitBreakerIntegration();

        System.out.println("\n" + "=".repeat(80));
        System.out.println("HEALTH CHECK API PATTERN DEMONSTRATION COMPLETED");
        System.out.println("=".repeat(80));
    }

    /**
     * Scenario 1: Basic Health Check
     * Demonstrates simple health check with multiple dependencies.
     */
    private static void demonstrateBasicHealthCheck() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 1: Basic Health Check");
        System.out.println("-".repeat(80));

        ServiceHealth orderService = new ServiceHealth("OrderService");
        orderService.addCheck(new DatabaseCheck("OrderDB", true));
        orderService.addCheck(new CacheCheck("Redis", true));
        orderService.addCheck(new ExternalAPICheck("PaymentGateway", true));

        System.out.println("Performing health check on OrderService...\n");
        HealthStatus status = orderService.checkHealth();
        System.out.println(status);

        System.out.println("HTTP Response: " + (status.isHealthy() ? "200 OK" : "503 Service Unavailable"));
    }

    /**
     * Scenario 2: Degraded Service Health
     * Shows partial failure where some dependencies are down but service remains operational.
     */
    private static void demonstrateDegradedHealth() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 2: Degraded Service Health");
        System.out.println("-".repeat(80));

        ServiceHealth productService = new ServiceHealth("ProductService");
        productService.addCheck(new DatabaseCheck("ProductDB", true));
        productService.addCheck(new CacheCheck("Redis", false)); // Cache down
        productService.addCheck(new ExternalAPICheck("InventoryAPI", true));
        productService.addCheck(new ExternalAPICheck("PricingAPI", false)); // Pricing API down

        System.out.println("Checking ProductService with partial failures...\n");
        HealthStatus status = productService.checkHealth();
        System.out.println(status);

        System.out.println("Service Mode: DEGRADED - Operating with reduced functionality");
        System.out.println("Impact: Cache misses will hit database; default pricing used");
    }

    /**
     * Scenario 3: Complete Service Failure
     * Demonstrates critical dependency failure making service unavailable.
     */
    private static void demonstrateServiceFailure() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 3: Complete Service Failure");
        System.out.println("-".repeat(80));

        ServiceHealth paymentService = new ServiceHealth("PaymentService");
        paymentService.addCheck(new DatabaseCheck("PaymentDB", false)); // Critical DB down
        paymentService.addCheck(new ExternalAPICheck("StripeAPI", true));

        System.out.println("Checking PaymentService with critical failure...\n");
        HealthStatus status = paymentService.checkHealth();
        System.out.println(status);

        System.out.println("Action: Load balancer removes instance from pool");
        System.out.println("Alert: PagerDuty incident triggered for on-call engineer");
    }

    /**
     * Scenario 4: Health Check with Timeouts
     * Shows timeout handling to prevent hanging health checks.
     */
    private static void demonstrateHealthCheckTimeouts() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 4: Health Check with Timeouts");
        System.out.println("-".repeat(80));

        ServiceHealth userService = new ServiceHealth("UserService");
        userService.addCheck(new DatabaseCheck("UserDB", true));
        userService.addCheck(new SlowHealthCheck("LegacySystem", 5000)); // Slow check

        System.out.println("Performing health check with timeout protection...\n");
        HealthStatus status = userService.checkHealthWithTimeout(1000); // 1 second timeout
        System.out.println(status);

        System.out.println("Timeout protection prevented hanging health check");
    }

    /**
     * Scenario 5: Cascading Health Checks
     * Demonstrates dependency health propagation across service chain.
     */
    private static void demonstrateCascadingHealthChecks() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 5: Cascading Health Checks");
        System.out.println("-".repeat(80));

        // Downstream service
        ServiceHealth inventoryService = new ServiceHealth("InventoryService");
        inventoryService.addCheck(new DatabaseCheck("InventoryDB", false));

        // Upstream service depends on downstream
        ServiceHealth catalogService = new ServiceHealth("CatalogService");
        catalogService.addCheck(new DatabaseCheck("CatalogDB", true));
        catalogService.addCheck(new ServiceDependencyCheck("InventoryService", inventoryService));

        System.out.println("Checking CatalogService with dependency chain...\n");
        HealthStatus status = catalogService.checkHealth();
        System.out.println(status);

        System.out.println("Impact: Downstream failure cascades to upstream service");
    }

    /**
     * Scenario 6: Microservices Mesh Health Aggregation
     * Shows health aggregation across multiple services in a mesh.
     */
    private static void demonstrateMicroservicesMeshHealth() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 6: Microservices Mesh Health Aggregation");
        System.out.println("-".repeat(80));

        HealthAggregator aggregator = new HealthAggregator();

        ServiceHealth[] services = {
            createService("OrderService", true, true, true),
            createService("PaymentService", true, false, true),
            createService("ShippingService", true, true, true),
            createService("NotificationService", false, true, true)
        };

        for (ServiceHealth service : services) {
            aggregator.addService(service);
        }

        System.out.println("Aggregating health across microservices mesh...\n");
        MeshHealthStatus meshStatus = aggregator.aggregateHealth();
        System.out.println(meshStatus);
    }

    /**
     * Scenario 7: Kubernetes-Style Probes
     * Demonstrates liveness and readiness probes for container orchestration.
     */
    private static void demonstrateKubernetesProbes() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 7: Kubernetes-Style Liveness and Readiness Probes");
        System.out.println("-".repeat(80));

        KubernetesHealthProbe probe = new KubernetesHealthProbe("OrderService");

        System.out.println("Liveness Probe: Checking if container should be restarted");
        boolean alive = probe.livenessProbe();
        System.out.println("  Result: " + (alive ? "ALIVE" : "DEAD - restart required"));

        System.out.println("\nReadiness Probe: Checking if pod can receive traffic");
        boolean ready = probe.readinessProbe();
        System.out.println("  Result: " + (ready ? "READY - can receive traffic" : "NOT READY - warming up"));

        System.out.println("\nStartup Probe: Checking if application has started");
        boolean started = probe.startupProbe();
        System.out.println("  Result: " + (started ? "STARTED" : "STARTING - wait longer"));
    }

    /**
     * Scenario 8: Auto-Recovery Health Monitoring
     * Shows automatic recovery attempts when health checks fail.
     */
    private static void demonstrateAutoRecovery() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 8: Auto-Recovery Health Monitoring");
        System.out.println("-".repeat(80));

        AutoRecoveryHealthMonitor monitor = new AutoRecoveryHealthMonitor("ShippingService");
        monitor.addCheck(new DatabaseCheck("ShippingDB", false));
        monitor.addCheck(new CacheCheck("Redis", false));

        System.out.println("Monitoring service health with auto-recovery...\n");
        monitor.monitorWithRecovery();
    }

    /**
     * Scenario 9: Health Metrics and SLA Tracking
     * Demonstrates tracking health metrics for SLA compliance.
     */
    private static void demonstrateHealthMetrics() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 9: Health Metrics and SLA Tracking");
        System.out.println("-".repeat(80));

        HealthMetricsTracker tracker = new HealthMetricsTracker("PaymentService");

        // Simulate health checks over time
        for (int i = 0; i < 100; i++) {
            boolean healthy = Math.random() > 0.05; // 95% uptime
            tracker.recordHealthCheck(healthy);
        }

        System.out.println("Health Metrics Summary:\n");
        tracker.printMetrics();
    }

    /**
     * Scenario 10: Circuit Breaker Integration
     * Shows integration of health checks with circuit breaker pattern.
     */
    private static void demonstrateCircuitBreakerIntegration() {
        System.out.println("\n" + "-".repeat(80));
        System.out.println("SCENARIO 10: Circuit Breaker Integration with Health Checks");
        System.out.println("-".repeat(80));

        CircuitBreakerHealthCheck circuitBreaker = new CircuitBreakerHealthCheck("ExternalPaymentAPI");

        System.out.println("Simulating requests with circuit breaker...\n");

        // Simulate failures
        for (int i = 0; i < 5; i++) {
            circuitBreaker.makeRequest();
        }

        System.out.println("\nCircuit Breaker State: " + circuitBreaker.getState());
        System.out.println("Health Check Result: " + circuitBreaker.isHealthy());

        // Wait for recovery
        System.out.println("\nWaiting for circuit breaker recovery...");
        circuitBreaker.attemptReset();
        System.out.println("Circuit Breaker State: " + circuitBreaker.getState());
    }

    // Helper method to create service with health checks
    private static ServiceHealth createService(String name, boolean dbHealth, boolean cacheHealth, boolean apiHealth) {
        ServiceHealth service = new ServiceHealth(name);
        service.addCheck(new DatabaseCheck(name + "DB", dbHealth));
        service.addCheck(new CacheCheck("Redis", cacheHealth));
        service.addCheck(new ExternalAPICheck("ExternalAPI", apiHealth));
        return service;
    }
}

/**
 * Slow health check to demonstrate timeout handling.
 */
class SlowHealthCheck implements HealthCheck {
    private String name;
    private long delayMs;

    public SlowHealthCheck(String name, long delayMs) {
        this.name = name;
        this.delayMs = delayMs;
    }

    @Override
    public boolean isHealthy() {
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return true;
    }

    @Override
    public String getName() {
        return name;
    }
}

/**
 * Service dependency health check for cascading checks.
 */
class ServiceDependencyCheck implements HealthCheck {
    private String serviceName;
    private ServiceHealth dependentService;

    public ServiceDependencyCheck(String serviceName, ServiceHealth dependentService) {
        this.serviceName = serviceName;
        this.dependentService = dependentService;
    }

    @Override
    public boolean isHealthy() {
        return dependentService.checkHealth().isHealthy();
    }

    @Override
    public String getName() {
        return "Dependency: " + serviceName;
    }
}

/**
 * Health aggregator for microservices mesh.
 */
class HealthAggregator {
    private List<ServiceHealth> services = new ArrayList<>();

    public void addService(ServiceHealth service) {
        services.add(service);
    }

    public MeshHealthStatus aggregateHealth() {
        int totalServices = services.size();
        int healthyServices = 0;
        Map<String, HealthStatus> statusMap = new HashMap<>();

        for (ServiceHealth service : services) {
            HealthStatus status = service.checkHealth();
            statusMap.put(status.serviceName, status);
            if (status.isHealthy()) {
                healthyServices++;
            }
        }

        return new MeshHealthStatus(totalServices, healthyServices, statusMap);
    }
}

/**
 * Mesh health status aggregation.
 */
class MeshHealthStatus {
    int totalServices;
    int healthyServices;
    Map<String, HealthStatus> serviceStatus;

    public MeshHealthStatus(int totalServices, int healthyServices, Map<String, HealthStatus> serviceStatus) {
        this.totalServices = totalServices;
        this.healthyServices = healthyServices;
        this.serviceStatus = serviceStatus;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Microservices Mesh Health Status:\n");
        sb.append("  Total Services: ").append(totalServices).append("\n");
        sb.append("  Healthy Services: ").append(healthyServices).append("\n");
        sb.append("  Unhealthy Services: ").append(totalServices - healthyServices).append("\n");
        sb.append("  Overall Health: ").append(String.format("%.1f%%", (healthyServices * 100.0 / totalServices))).append("\n\n");

        serviceStatus.forEach((name, status) -> {
            sb.append("  ").append(name).append(": ").append(status.overallStatus).append("\n");
        });

        return sb.toString();
    }
}

/**
 * Kubernetes-style health probes.
 */
class KubernetesHealthProbe {
    private String serviceName;
    private LocalDateTime startTime = LocalDateTime.now();
    private boolean initialized = false;

    public KubernetesHealthProbe(String serviceName) {
        this.serviceName = serviceName;
    }

    public boolean livenessProbe() {
        // Check if application is alive (not deadlocked)
        return true; // Simplified - would check thread health, etc.
    }

    public boolean readinessProbe() {
        // Check if application can handle requests
        return initialized && Duration.between(startTime, LocalDateTime.now()).getSeconds() > 5;
    }

    public boolean startupProbe() {
        // Check if application has finished starting
        if (Duration.between(startTime, LocalDateTime.now()).getSeconds() > 3) {
            initialized = true;
            return true;
        }
        return false;
    }
}

/**
 * Auto-recovery health monitor.
 */
class AutoRecoveryHealthMonitor {
    private String serviceName;
    private List<HealthCheck> checks = new ArrayList<>();

    public AutoRecoveryHealthMonitor(String serviceName) {
        this.serviceName = serviceName;
    }

    public void addCheck(HealthCheck check) {
        checks.add(check);
    }

    public void monitorWithRecovery() {
        for (HealthCheck check : checks) {
            if (!check.isHealthy()) {
                System.out.println("  " + check.getName() + " is DOWN - attempting recovery...");
                attemptRecovery(check);
            } else {
                System.out.println("  " + check.getName() + " is UP");
            }
        }
    }

    private void attemptRecovery(HealthCheck check) {
        System.out.println("    - Restarting " + check.getName() + " component");
        System.out.println("    - Reconnecting to " + check.getName());
        System.out.println("    - Recovery completed");
    }
}

/**
 * Health metrics tracker for SLA monitoring.
 */
class HealthMetricsTracker {
    private String serviceName;
    private int totalChecks = 0;
    private int healthyChecks = 0;
    private LocalDateTime trackingStart = LocalDateTime.now();

    public HealthMetricsTracker(String serviceName) {
        this.serviceName = serviceName;
    }

    public void recordHealthCheck(boolean healthy) {
        totalChecks++;
        if (healthy) {
            healthyChecks++;
        }
    }

    public void printMetrics() {
        double uptime = (healthyChecks * 100.0 / totalChecks);
        Duration trackingDuration = Duration.between(trackingStart, LocalDateTime.now());

        System.out.println("Service: " + serviceName);
        System.out.println("  Total Health Checks: " + totalChecks);
        System.out.println("  Successful Checks: " + healthyChecks);
        System.out.println("  Failed Checks: " + (totalChecks - healthyChecks));
        System.out.println("  Uptime: " + String.format("%.2f%%", uptime));
        System.out.println("  SLA Target: 99.9%");
        System.out.println("  SLA Status: " + (uptime >= 99.9 ? "MEETING" : "BELOW") + " target");
        System.out.println("  Tracking Duration: " + trackingDuration.getSeconds() + " seconds");
    }
}

/**
 * Circuit breaker health check integration.
 */
class CircuitBreakerHealthCheck {
    private String serviceName;
    private int failureCount = 0;
    private int threshold = 3;
    private String state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN

    public CircuitBreakerHealthCheck(String serviceName) {
        this.serviceName = serviceName;
    }

    public void makeRequest() {
        if (state.equals("OPEN")) {
            System.out.println("  Request blocked - circuit breaker OPEN");
            return;
        }

        // Simulate failure
        boolean success = false;
        if (!success) {
            failureCount++;
            System.out.println("  Request failed - failure count: " + failureCount);

            if (failureCount >= threshold) {
                state = "OPEN";
                System.out.println("  Circuit breaker OPENED after " + threshold + " failures");
            }
        }
    }

    public void attemptReset() {
        if (state.equals("OPEN")) {
            state = "HALF_OPEN";
            failureCount = 0;
            System.out.println("  Circuit breaker moved to HALF_OPEN state");
        }
    }

    public boolean isHealthy() {
        return !state.equals("OPEN");
    }

    public String getState() {
        return state;
    }
}
