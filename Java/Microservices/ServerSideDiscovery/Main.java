package Microservices.ServerSideDiscovery;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;

/**
 * Server-Side Discovery Pattern Demonstration
 *
 * In server-side discovery, clients make requests to a load balancer or API gateway
 * that queries the service registry and forwards requests to available service instances.
 *
 * Key Concepts:
 * - Load balancer acts as intermediary between client and services
 * - Load balancer queries service registry
 * - Load balancer handles routing and load distribution
 * - Examples: AWS ELB, Nginx Plus, HAProxy with Consul
 *
 * Advantages:
 * - Decouples clients from service registry
 * - Centralized load balancing logic
 * - Simpler client implementation
 *
 * Disadvantages:
 * - Additional network hop
 * - Load balancer becomes potential bottleneck
 * - Requires highly available load balancer
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Server-Side Discovery Pattern Demo ===\n");

        // Scenario 1: Basic server-side discovery with load balancer
        demonstrateBasicServerSideDiscovery();

        // Scenario 2: Load balancer with health checks
        demonstrateLoadBalancerHealthChecks();

        // Scenario 3: Multiple load balancing algorithms
        demonstrateLoadBalancingAlgorithms();

        // Scenario 4: API Gateway pattern
        demonstrateAPIGateway();

        // Scenario 5: Session affinity (sticky sessions)
        demonstrateSessionAffinity();

        // Scenario 6: Load balancer with circuit breaker
        demonstrateCircuitBreaker();

        // Scenario 7: Dynamic service registration
        demonstrateDynamicRegistration();

        // Scenario 8: Load balancer metrics and monitoring
        demonstrateMetricsAndMonitoring();

        // Scenario 9: Multi-zone load balancing
        demonstrateMultiZoneLoadBalancing();

        // Scenario 10: Real-world API Gateway scenario
        demonstrateRealWorldAPIGateway();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic server-side discovery with load balancer
     * Demonstrates fundamental server-side service discovery.
     */
    private static void demonstrateBasicServerSideDiscovery() {
        System.out.println("1. Basic Server-Side Discovery");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("OrderService", "192.168.1.10:8080");
        registry.register("OrderService", "192.168.1.11:8080");
        registry.register("PaymentService", "192.168.1.20:8080");

        LoadBalancer loadBalancer = new LoadBalancer(registry);

        System.out.println("\nClient requests (via load balancer):");
        loadBalancer.forward("OrderService", "/api/orders");
        loadBalancer.forward("OrderService", "/api/orders/123");
        loadBalancer.forward("PaymentService", "/api/payments");

        System.out.println("\nLoad balancer handles service discovery transparently");

        System.out.println();
    }

    /**
     * Scenario 2: Load balancer with health checks
     * Demonstrates health monitoring by load balancer.
     */
    private static void demonstrateLoadBalancerHealthChecks() {
        System.out.println("2. Load Balancer with Health Checks");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("UserService", "192.168.1.30:8080");
        registry.register("UserService", "192.168.1.31:8080");
        registry.register("UserService", "192.168.1.32:8080");

        HealthCheckingLoadBalancer healthLB = new HealthCheckingLoadBalancer(registry);

        System.out.println("\nPerforming health checks:");
        healthLB.performHealthChecks("UserService");

        System.out.println("\nForwarding requests to healthy instances:");
        for (int i = 0; i < 5; i++) {
            healthLB.forward("UserService", "/api/users");
        }

        System.out.println();
    }

    /**
     * Scenario 3: Multiple load balancing algorithms
     * Demonstrates different load balancing strategies.
     */
    private static void demonstrateLoadBalancingAlgorithms() {
        System.out.println("3. Multiple Load Balancing Algorithms");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("APIService", "192.168.1.40:8080");
        registry.register("APIService", "192.168.1.41:8080");
        registry.register("APIService", "192.168.1.42:8080");

        System.out.println("Round-Robin Algorithm:");
        RoundRobinLoadBalancer roundRobinLB = new RoundRobinLoadBalancer(registry);
        for (int i = 0; i < 6; i++) {
            roundRobinLB.forward("APIService", "/api/data");
        }

        System.out.println("\nLeast Connections Algorithm:");
        LeastConnectionsLoadBalancer leastConnLB = new LeastConnectionsLoadBalancer(registry);
        for (int i = 0; i < 4; i++) {
            leastConnLB.forward("APIService", "/api/data");
        }

        System.out.println();
    }

    /**
     * Scenario 4: API Gateway pattern
     * Demonstrates API Gateway as a single entry point.
     */
    private static void demonstrateAPIGateway() {
        System.out.println("4. API Gateway Pattern");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("UserService", "192.168.1.50:8080");
        registry.register("ProductService", "192.168.1.60:8080");
        registry.register("OrderService", "192.168.1.70:8080");

        APIGateway gateway = new APIGateway(registry);

        System.out.println("\nClient requests through API Gateway:");
        gateway.handleRequest("/users/123");
        gateway.handleRequest("/products/456");
        gateway.handleRequest("/orders/789");

        System.out.println("\nAPI Gateway provides unified interface");

        System.out.println();
    }

    /**
     * Scenario 5: Session affinity (sticky sessions)
     * Demonstrates routing requests from same client to same instance.
     */
    private static void demonstrateSessionAffinity() {
        System.out.println("5. Session Affinity (Sticky Sessions)");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("SessionService", "192.168.1.80:8080");
        registry.register("SessionService", "192.168.1.81:8080");
        registry.register("SessionService", "192.168.1.82:8080");

        StickySessionLoadBalancer stickyLB = new StickySessionLoadBalancer(registry);

        System.out.println("\nRequests from user 'alice':");
        for (int i = 0; i < 3; i++) {
            stickyLB.forwardWithSession("SessionService", "/api/session", "alice");
        }

        System.out.println("\nRequests from user 'bob':");
        for (int i = 0; i < 3; i++) {
            stickyLB.forwardWithSession("SessionService", "/api/session", "bob");
        }

        System.out.println("\nSticky sessions maintain client affinity");

        System.out.println();
    }

    /**
     * Scenario 6: Load balancer with circuit breaker
     * Demonstrates circuit breaker pattern in load balancer.
     */
    private static void demonstrateCircuitBreaker() {
        System.out.println("6. Load Balancer with Circuit Breaker");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("UnstableService", "192.168.1.90:8080");
        registry.register("UnstableService", "192.168.1.91:8080");

        CircuitBreakerLoadBalancer circuitBreakerLB = new CircuitBreakerLoadBalancer(registry);

        System.out.println("\nSimulating requests with failures:");
        for (int i = 0; i < 10; i++) {
            circuitBreakerLB.forward("UnstableService", "/api/process");
        }

        System.out.println("\nCircuit breaker prevents cascading failures");

        System.out.println();
    }

    /**
     * Scenario 7: Dynamic service registration
     * Demonstrates services dynamically registering and deregistering.
     */
    private static void demonstrateDynamicRegistration() {
        System.out.println("7. Dynamic Service Registration");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        LoadBalancer loadBalancer = new LoadBalancer(registry);

        System.out.println("Initial state:");
        registry.register("DynamicService", "192.168.1.100:8080");
        loadBalancer.forward("DynamicService", "/api/test");

        System.out.println("\nAdding new instances:");
        registry.register("DynamicService", "192.168.1.101:8080");
        registry.register("DynamicService", "192.168.1.102:8080");

        System.out.println("\nLoad balancer automatically uses new instances:");
        for (int i = 0; i < 6; i++) {
            loadBalancer.forward("DynamicService", "/api/test");
        }

        System.out.println();
    }

    /**
     * Scenario 8: Load balancer metrics and monitoring
     * Demonstrates collecting and reporting metrics.
     */
    private static void demonstrateMetricsAndMonitoring() {
        System.out.println("8. Load Balancer Metrics and Monitoring");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("MetricsService", "192.168.1.110:8080");
        registry.register("MetricsService", "192.168.1.111:8080");

        MetricsLoadBalancer metricsLB = new MetricsLoadBalancer(registry);

        System.out.println("\nProcessing requests:");
        for (int i = 0; i < 10; i++) {
            metricsLB.forward("MetricsService", "/api/data");
        }

        System.out.println("\nLoad Balancer Metrics:");
        metricsLB.printMetrics();

        System.out.println();
    }

    /**
     * Scenario 9: Multi-zone load balancing
     * Demonstrates routing across availability zones.
     */
    private static void demonstrateMultiZoneLoadBalancing() {
        System.out.println("9. Multi-Zone Load Balancing");
        System.out.println("-".repeat(50));

        ZoneAwareServiceRegistry zoneRegistry = new ZoneAwareServiceRegistry();
        zoneRegistry.register("GlobalService", "192.168.1.120:8080", "us-east-1a");
        zoneRegistry.register("GlobalService", "192.168.1.121:8080", "us-east-1b");
        zoneRegistry.register("GlobalService", "192.168.2.120:8080", "us-west-1a");

        ZoneAwareLoadBalancer zoneLB = new ZoneAwareLoadBalancer(zoneRegistry);

        System.out.println("\nRequests from us-east region:");
        zoneLB.forwardWithZonePreference("GlobalService", "/api/data", "us-east-1a");
        zoneLB.forwardWithZonePreference("GlobalService", "/api/data", "us-east-1b");

        System.out.println("\nRequests from us-west region:");
        zoneLB.forwardWithZonePreference("GlobalService", "/api/data", "us-west-1a");

        System.out.println();
    }

    /**
     * Scenario 10: Real-world API Gateway scenario
     * Demonstrates complete API Gateway with authentication, routing, and aggregation.
     */
    private static void demonstrateRealWorldAPIGateway() {
        System.out.println("10. Real-World API Gateway Scenario");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register all microservices
        registry.register("AuthService", "192.168.1.130:8080");
        registry.register("UserService", "192.168.1.131:8080");
        registry.register("ProductService", "192.168.1.132:8080");
        registry.register("OrderService", "192.168.1.133:8080");
        registry.register("PaymentService", "192.168.1.134:8080");
        registry.register("NotificationService", "192.168.1.135:8080");

        EnterpriseAPIGateway enterpriseGateway = new EnterpriseAPIGateway(registry);

        System.out.println("\nProcessing e-commerce requests:");
        enterpriseGateway.processRequest("user123", "/checkout", "POST");

        System.out.println("\nAPI Gateway handles routing, auth, and orchestration");

        System.out.println();
    }
}

/**
 * Service registry for storing service locations.
 */
class ServiceRegistry {
    private final Map<String, List<String>> services;

    public ServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(String serviceName, String location) {
        services.computeIfAbsent(serviceName, k -> new CopyOnWriteArrayList<>()).add(location);
        System.out.println("Registered: " + serviceName + " at " + location);
    }

    public void deregister(String serviceName, String location) {
        List<String> instances = services.get(serviceName);
        if (instances != null) {
            instances.remove(location);
            System.out.println("Deregistered: " + serviceName + " at " + location);
        }
    }

    public List<String> getInstances(String serviceName) {
        return new ArrayList<>(services.getOrDefault(serviceName, Collections.emptyList()));
    }

    public boolean hasService(String serviceName) {
        return services.containsKey(serviceName) && !services.get(serviceName).isEmpty();
    }
}

/**
 * Basic load balancer with round-robin distribution.
 */
class LoadBalancer {
    protected final ServiceRegistry registry;
    private final Map<String, Integer> roundRobinCounters;

    public LoadBalancer(ServiceRegistry registry) {
        this.registry = registry;
        this.roundRobinCounters = new ConcurrentHashMap<>();
    }

    public void forward(String serviceName, String endpoint) {
        List<String> instances = registry.getInstances(serviceName);
        if (instances.isEmpty()) {
            System.out.println("  ERROR: No instances available for " + serviceName);
            return;
        }

        int counter = roundRobinCounters.getOrDefault(serviceName, 0);
        String instance = instances.get(counter % instances.size());
        roundRobinCounters.put(serviceName, counter + 1);

        System.out.println("  Forwarding to " + instance + endpoint);
    }
}

/**
 * Load balancer with health checking capabilities.
 */
class HealthCheckingLoadBalancer extends LoadBalancer {
    private final Set<String> unhealthyInstances;

    public HealthCheckingLoadBalancer(ServiceRegistry registry) {
        super(registry);
        this.unhealthyInstances = ConcurrentHashMap.newKeySet();
    }

    public void performHealthChecks(String serviceName) {
        List<String> instances = registry.getInstances(serviceName);
        for (String instance : instances) {
            boolean healthy = checkHealth(instance);
            if (healthy) {
                unhealthyInstances.remove(instance);
                System.out.println("  " + instance + " - HEALTHY");
            } else {
                unhealthyInstances.add(instance);
                System.out.println("  " + instance + " - UNHEALTHY");
            }
        }
    }

    @Override
    public void forward(String serviceName, String endpoint) {
        List<String> instances = registry.getInstances(serviceName);
        List<String> healthyInstances = instances.stream()
            .filter(instance -> !unhealthyInstances.contains(instance))
            .toList();

        if (healthyInstances.isEmpty()) {
            System.out.println("  ERROR: No healthy instances for " + serviceName);
            return;
        }

        String instance = healthyInstances.get(0);
        System.out.println("  Forwarding to healthy instance: " + instance + endpoint);
    }

    private boolean checkHealth(String instance) {
        // Simulate health check
        return Math.random() > 0.3;
    }
}

/**
 * Round-robin load balancer.
 */
class RoundRobinLoadBalancer extends LoadBalancer {
    public RoundRobinLoadBalancer(ServiceRegistry registry) {
        super(registry);
    }
}

/**
 * Least connections load balancer.
 */
class LeastConnectionsLoadBalancer extends LoadBalancer {
    private final Map<String, Integer> activeConnections;

    public LeastConnectionsLoadBalancer(ServiceRegistry registry) {
        super(registry);
        this.activeConnections = new ConcurrentHashMap<>();
    }

    @Override
    public void forward(String serviceName, String endpoint) {
        List<String> instances = registry.getInstances(serviceName);
        if (instances.isEmpty()) {
            System.out.println("  ERROR: No instances available");
            return;
        }

        String leastLoadedInstance = instances.stream()
            .min(Comparator.comparingInt(instance -> activeConnections.getOrDefault(instance, 0)))
            .orElse(instances.get(0));

        activeConnections.put(leastLoadedInstance, activeConnections.getOrDefault(leastLoadedInstance, 0) + 1);
        System.out.println("  Forwarding to " + leastLoadedInstance + endpoint +
                         " (connections: " + activeConnections.get(leastLoadedInstance) + ")");

        // Simulate connection completion
        activeConnections.put(leastLoadedInstance, activeConnections.get(leastLoadedInstance) - 1);
    }
}

/**
 * API Gateway for routing client requests.
 */
class APIGateway {
    private final LoadBalancer loadBalancer;

    public APIGateway(ServiceRegistry registry) {
        this.loadBalancer = new LoadBalancer(registry);
    }

    public void handleRequest(String path) {
        System.out.println("API Gateway received: " + path);

        String serviceName = routeToService(path);
        if (serviceName != null) {
            loadBalancer.forward(serviceName, path);
        } else {
            System.out.println("  ERROR: No route found for " + path);
        }
    }

    private String routeToService(String path) {
        if (path.startsWith("/users")) return "UserService";
        if (path.startsWith("/products")) return "ProductService";
        if (path.startsWith("/orders")) return "OrderService";
        return null;
    }
}

/**
 * Load balancer with sticky session support.
 */
class StickySessionLoadBalancer extends LoadBalancer {
    private final Map<String, String> sessionMap;

    public StickySessionLoadBalancer(ServiceRegistry registry) {
        super(registry);
        this.sessionMap = new ConcurrentHashMap<>();
    }

    public void forwardWithSession(String serviceName, String endpoint, String sessionId) {
        String assignedInstance = sessionMap.get(sessionId);

        if (assignedInstance == null) {
            List<String> instances = registry.getInstances(serviceName);
            if (instances.isEmpty()) {
                System.out.println("  ERROR: No instances available");
                return;
            }
            assignedInstance = instances.get(sessionId.hashCode() % instances.size());
            sessionMap.put(sessionId, assignedInstance);
            System.out.println("  New session '" + sessionId + "' assigned to " + assignedInstance);
        } else {
            System.out.println("  Existing session '" + sessionId + "' -> " + assignedInstance + endpoint);
        }
    }
}

/**
 * Load balancer with circuit breaker pattern.
 */
class CircuitBreakerLoadBalancer extends LoadBalancer {
    private final Map<String, CircuitBreakerState> circuitStates;
    private static final int FAILURE_THRESHOLD = 3;

    public CircuitBreakerLoadBalancer(ServiceRegistry registry) {
        super(registry);
        this.circuitStates = new ConcurrentHashMap<>();
    }

    @Override
    public void forward(String serviceName, String endpoint) {
        List<String> instances = registry.getInstances(serviceName);
        if (instances.isEmpty()) {
            System.out.println("  ERROR: No instances available");
            return;
        }

        for (String instance : instances) {
            CircuitBreakerState state = circuitStates.computeIfAbsent(instance,
                k -> new CircuitBreakerState());

            if (state.isOpen()) {
                System.out.println("  Circuit OPEN for " + instance + " - skipping");
                continue;
            }

            boolean success = attemptRequest(instance, endpoint);
            if (success) {
                state.recordSuccess();
                System.out.println("  Success: " + instance + endpoint);
                return;
            } else {
                state.recordFailure();
                System.out.println("  Failure: " + instance + " (failures: " + state.getFailureCount() + ")");
            }
        }

        System.out.println("  ERROR: All instances failed or circuit breakers open");
    }

    private boolean attemptRequest(String instance, String endpoint) {
        return Math.random() > 0.5;
    }

    /**
     * Circuit breaker state tracking.
     */
    static class CircuitBreakerState {
        private int failureCount = 0;
        private boolean open = false;

        public void recordSuccess() {
            failureCount = 0;
            open = false;
        }

        public void recordFailure() {
            failureCount++;
            if (failureCount >= FAILURE_THRESHOLD) {
                open = true;
            }
        }

        public boolean isOpen() {
            return open;
        }

        public int getFailureCount() {
            return failureCount;
        }
    }
}

/**
 * Load balancer with metrics collection.
 */
class MetricsLoadBalancer extends LoadBalancer {
    private int totalRequests = 0;
    private final Map<String, Integer> requestsPerInstance;

    public MetricsLoadBalancer(ServiceRegistry registry) {
        super(registry);
        this.requestsPerInstance = new ConcurrentHashMap<>();
    }

    @Override
    public void forward(String serviceName, String endpoint) {
        super.forward(serviceName, endpoint);
        totalRequests++;

        List<String> instances = registry.getInstances(serviceName);
        if (!instances.isEmpty()) {
            String instance = instances.get(0);
            requestsPerInstance.put(instance, requestsPerInstance.getOrDefault(instance, 0) + 1);
        }
    }

    public void printMetrics() {
        System.out.println("  Total requests: " + totalRequests);
        System.out.println("  Requests per instance:");
        requestsPerInstance.forEach((instance, count) ->
            System.out.println("    " + instance + ": " + count));
    }
}

/**
 * Zone-aware service registry.
 */
class ZoneAwareServiceRegistry {
    private final Map<String, List<ServiceWithZone>> services;

    public ZoneAwareServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(String serviceName, String location, String zone) {
        ServiceWithZone service = new ServiceWithZone(location, zone);
        services.computeIfAbsent(serviceName, k -> new CopyOnWriteArrayList<>()).add(service);
        System.out.println("Registered: " + serviceName + " at " + location + " (zone: " + zone + ")");
    }

    public List<ServiceWithZone> getInstancesInZone(String serviceName, String zone) {
        return services.getOrDefault(serviceName, Collections.emptyList())
            .stream()
            .filter(service -> service.getZone().equals(zone))
            .toList();
    }

    public List<ServiceWithZone> getAllInstances(String serviceName) {
        return new ArrayList<>(services.getOrDefault(serviceName, Collections.emptyList()));
    }

    /**
     * Service instance with zone information.
     */
    static class ServiceWithZone {
        private final String location;
        private final String zone;

        public ServiceWithZone(String location, String zone) {
            this.location = location;
            this.zone = zone;
        }

        public String getLocation() {
            return location;
        }

        public String getZone() {
            return zone;
        }
    }
}

/**
 * Zone-aware load balancer.
 */
class ZoneAwareLoadBalancer {
    private final ZoneAwareServiceRegistry registry;

    public ZoneAwareLoadBalancer(ZoneAwareServiceRegistry registry) {
        this.registry = registry;
    }

    public void forwardWithZonePreference(String serviceName, String endpoint, String preferredZone) {
        List<ZoneAwareServiceRegistry.ServiceWithZone> localInstances =
            registry.getInstancesInZone(serviceName, preferredZone);

        if (!localInstances.isEmpty()) {
            ZoneAwareServiceRegistry.ServiceWithZone instance = localInstances.get(0);
            System.out.println("  Forwarding to local zone: " + instance.getLocation() + endpoint +
                             " (zone: " + instance.getZone() + ")");
        } else {
            List<ZoneAwareServiceRegistry.ServiceWithZone> allInstances =
                registry.getAllInstances(serviceName);
            if (!allInstances.isEmpty()) {
                ZoneAwareServiceRegistry.ServiceWithZone instance = allInstances.get(0);
                System.out.println("  Forwarding to remote zone: " + instance.getLocation() + endpoint +
                                 " (zone: " + instance.getZone() + ")");
            } else {
                System.out.println("  ERROR: No instances available");
            }
        }
    }
}

/**
 * Enterprise-grade API Gateway with full features.
 */
class EnterpriseAPIGateway {
    private final ServiceRegistry registry;
    private final LoadBalancer loadBalancer;

    public EnterpriseAPIGateway(ServiceRegistry registry) {
        this.registry = registry;
        this.loadBalancer = new LoadBalancer(registry);
    }

    public void processRequest(String userId, String path, String method) {
        System.out.println("\n1. Request received: " + method + " " + path + " (user: " + userId + ")");

        // Step 1: Authentication
        System.out.println("2. Authenticating user...");
        loadBalancer.forward("AuthService", "/auth/validate");

        // Step 2: Route to appropriate services
        if ("/checkout".equals(path)) {
            processCheckout(userId);
        } else {
            System.out.println("3. Routing to service...");
            String serviceName = determineService(path);
            if (serviceName != null) {
                loadBalancer.forward(serviceName, path);
            }
        }
    }

    private void processCheckout(String userId) {
        System.out.println("3. Processing checkout workflow:");

        System.out.println("   - Validating user");
        loadBalancer.forward("UserService", "/users/" + userId);

        System.out.println("   - Creating order");
        loadBalancer.forward("OrderService", "/orders/create");

        System.out.println("   - Processing payment");
        loadBalancer.forward("PaymentService", "/payments/process");

        System.out.println("   - Sending notification");
        loadBalancer.forward("NotificationService", "/notifications/send");

        System.out.println("4. Checkout completed successfully");
    }

    private String determineService(String path) {
        if (path.startsWith("/users")) return "UserService";
        if (path.startsWith("/products")) return "ProductService";
        if (path.startsWith("/orders")) return "OrderService";
        return null;
    }
}
