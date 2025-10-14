package Microservices.ServiceDiscovery;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;

/**
 * ServiceDiscovery Pattern Demonstration
 *
 * Enables services to find and communicate with each other dynamically.
 * Service Discovery is a fundamental pattern in microservices architecture that allows
 * services to locate each other without hardcoding locations.
 *
 * Key Concepts:
 * - Service Registration: Services register themselves with a discovery service
 * - Service Lookup: Clients query the discovery service to find available instances
 * - Health Checks: Monitor service availability and remove unhealthy instances
 * - Load Balancing: Distribute requests across multiple service instances
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceDiscovery Pattern Demo ===\n");

        // Scenario 1: Basic service registration and discovery
        demonstrateBasicRegistrationAndDiscovery();

        // Scenario 2: Multiple service instances with load balancing
        demonstrateLoadBalancing();

        // Scenario 3: Health check monitoring
        demonstrateHealthCheckMonitoring();

        // Scenario 4: Service deregistration
        demonstrateServiceDeregistration();

        // Scenario 5: Service metadata and filtering
        demonstrateServiceMetadata();

        // Scenario 6: Failover and retry mechanisms
        demonstrateFailoverAndRetry();

        // Scenario 7: Service versioning
        demonstrateServiceVersioning();

        // Scenario 8: Dynamic service updates
        demonstrateDynamicServiceUpdates();

        // Scenario 9: Service discovery with zones
        demonstrateZoneBasedDiscovery();

        // Scenario 10: Real-world microservices ecosystem
        demonstrateRealWorldEcosystem();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic service registration and discovery
     * Demonstrates the fundamental concept of registering services and discovering them.
     */
    private static void demonstrateBasicRegistrationAndDiscovery() {
        System.out.println("1. Basic Service Registration and Discovery");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register services
        ServiceInstance userService = new ServiceInstance(
            "user-service",
            "192.168.1.100",
            8080,
            "http"
        );
        registry.register(userService);
        System.out.println("Registered: " + userService);

        ServiceInstance orderService = new ServiceInstance(
            "order-service",
            "192.168.1.101",
            8081,
            "http"
        );
        registry.register(orderService);
        System.out.println("Registered: " + orderService);

        // Discover services
        System.out.println("\nDiscovering services:");
        List<ServiceInstance> userServices = registry.discover("user-service");
        System.out.println("Found " + userServices.size() + " instance(s) of user-service");

        List<ServiceInstance> orderServices = registry.discover("order-service");
        System.out.println("Found " + orderServices.size() + " instance(s) of order-service");

        System.out.println();
    }

    /**
     * Scenario 2: Multiple service instances with load balancing
     * Demonstrates horizontal scaling with multiple instances of the same service.
     */
    private static void demonstrateLoadBalancing() {
        System.out.println("2. Load Balancing Across Multiple Instances");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        LoadBalancer loadBalancer = new LoadBalancer(registry);

        // Register multiple instances of the same service
        registry.register(new ServiceInstance("api-service", "192.168.1.10", 8080, "http"));
        registry.register(new ServiceInstance("api-service", "192.168.1.11", 8080, "http"));
        registry.register(new ServiceInstance("api-service", "192.168.1.12", 8080, "http"));

        System.out.println("Registered 3 instances of api-service\n");

        // Make multiple requests to demonstrate load balancing
        System.out.println("Making 6 requests with round-robin load balancing:");
        for (int i = 1; i <= 6; i++) {
            ServiceInstance instance = loadBalancer.getNextInstance("api-service");
            System.out.println("Request " + i + " -> " + instance.getHost() + ":" + instance.getPort());
        }

        System.out.println();
    }

    /**
     * Scenario 3: Health check monitoring
     * Demonstrates automatic health checks and removal of unhealthy services.
     */
    private static void demonstrateHealthCheckMonitoring() {
        System.out.println("3. Health Check Monitoring");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        HealthChecker healthChecker = new HealthChecker(registry);

        // Register services with different health statuses
        ServiceInstance healthyService = new ServiceInstance("payment-service", "192.168.1.20", 9000, "https");
        ServiceInstance unhealthyService = new ServiceInstance("payment-service", "192.168.1.21", 9000, "https");
        unhealthyService.setHealthy(false);

        registry.register(healthyService);
        registry.register(unhealthyService);

        System.out.println("Registered 2 payment-service instances");
        System.out.println("Instance 1 (192.168.1.20): HEALTHY");
        System.out.println("Instance 2 (192.168.1.21): UNHEALTHY\n");

        // Perform health check
        healthChecker.performHealthChecks();

        System.out.println("\nAfter health check, available instances:");
        List<ServiceInstance> healthyInstances = registry.discover("payment-service");
        for (ServiceInstance instance : healthyInstances) {
            System.out.println("  " + instance.getHost() + ":" + instance.getPort() +
                             " (Healthy: " + instance.isHealthy() + ")");
        }

        System.out.println();
    }

    /**
     * Scenario 4: Service deregistration
     * Demonstrates graceful shutdown and service deregistration.
     */
    private static void demonstrateServiceDeregistration() {
        System.out.println("4. Service Deregistration");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        ServiceInstance service1 = new ServiceInstance("notification-service", "192.168.1.30", 7000, "http");
        ServiceInstance service2 = new ServiceInstance("notification-service", "192.168.1.31", 7000, "http");

        registry.register(service1);
        registry.register(service2);

        System.out.println("Registered 2 notification-service instances");
        System.out.println("Available instances: " + registry.discover("notification-service").size());

        // Deregister one instance
        System.out.println("\nDeregistering instance at 192.168.1.30...");
        registry.deregister("notification-service", service1.getInstanceId());

        System.out.println("Available instances: " + registry.discover("notification-service").size());

        System.out.println();
    }

    /**
     * Scenario 5: Service metadata and filtering
     * Demonstrates using metadata for service filtering and selection.
     */
    private static void demonstrateServiceMetadata() {
        System.out.println("5. Service Metadata and Filtering");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register services with metadata
        ServiceInstance dbService1 = new ServiceInstance("database-service", "192.168.1.40", 5432, "tcp");
        dbService1.addMetadata("region", "us-east");
        dbService1.addMetadata("type", "primary");

        ServiceInstance dbService2 = new ServiceInstance("database-service", "192.168.1.41", 5432, "tcp");
        dbService2.addMetadata("region", "us-west");
        dbService2.addMetadata("type", "replica");

        registry.register(dbService1);
        registry.register(dbService2);

        System.out.println("Registered database services with metadata\n");

        // Filter by metadata
        List<ServiceInstance> allDbServices = registry.discover("database-service");
        System.out.println("All database services: " + allDbServices.size());

        System.out.println("\nFiltering by region=us-east:");
        for (ServiceInstance instance : allDbServices) {
            if ("us-east".equals(instance.getMetadata().get("region"))) {
                System.out.println("  " + instance.getHost() + " (type: " +
                                 instance.getMetadata().get("type") + ")");
            }
        }

        System.out.println();
    }

    /**
     * Scenario 6: Failover and retry mechanisms
     * Demonstrates automatic failover when a service instance fails.
     */
    private static void demonstrateFailoverAndRetry() {
        System.out.println("6. Failover and Retry Mechanisms");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        FailoverHandler failoverHandler = new FailoverHandler(registry);

        // Register multiple instances
        registry.register(new ServiceInstance("auth-service", "192.168.1.50", 8443, "https"));
        registry.register(new ServiceInstance("auth-service", "192.168.1.51", 8443, "https"));
        registry.register(new ServiceInstance("auth-service", "192.168.1.52", 8443, "https"));

        System.out.println("Attempting to call auth-service with automatic failover:\n");

        // Simulate failed requests with automatic failover
        boolean success = failoverHandler.callWithFailover("auth-service", "/api/authenticate", 3);

        if (success) {
            System.out.println("\nRequest succeeded after failover");
        } else {
            System.out.println("\nRequest failed after all retry attempts");
        }

        System.out.println();
    }

    /**
     * Scenario 7: Service versioning
     * Demonstrates managing multiple versions of the same service.
     */
    private static void demonstrateServiceVersioning() {
        System.out.println("7. Service Versioning");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register different versions of the same service
        ServiceInstance v1 = new ServiceInstance("product-service", "192.168.1.60", 8080, "http");
        v1.addMetadata("version", "1.0");

        ServiceInstance v2 = new ServiceInstance("product-service", "192.168.1.61", 8080, "http");
        v2.addMetadata("version", "2.0");

        ServiceInstance v2Beta = new ServiceInstance("product-service", "192.168.1.62", 8080, "http");
        v2Beta.addMetadata("version", "2.0-beta");

        registry.register(v1);
        registry.register(v2);
        registry.register(v2Beta);

        System.out.println("Registered product-service with multiple versions\n");

        // Discover by version
        List<ServiceInstance> allVersions = registry.discover("product-service");
        System.out.println("All versions:");
        for (ServiceInstance instance : allVersions) {
            System.out.println("  " + instance.getHost() + " - version: " +
                             instance.getMetadata().get("version"));
        }

        System.out.println("\nClients can select specific versions based on their needs");

        System.out.println();
    }

    /**
     * Scenario 8: Dynamic service updates
     * Demonstrates updating service information dynamically.
     */
    private static void demonstrateDynamicServiceUpdates() {
        System.out.println("8. Dynamic Service Updates");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        ServiceInstance service = new ServiceInstance("analytics-service", "192.168.1.70", 9090, "http");
        service.addMetadata("load", "low");
        registry.register(service);

        System.out.println("Initial state: " + service.getHost() + " (load: " +
                         service.getMetadata().get("load") + ")");

        // Simulate load increase
        service.addMetadata("load", "high");
        registry.updateServiceMetadata(service);
        System.out.println("Updated state: " + service.getHost() + " (load: " +
                         service.getMetadata().get("load") + ")");

        // Simulate health status change
        service.setHealthy(false);
        System.out.println("Health status changed: " + service.getHost() + " (healthy: " +
                         service.isHealthy() + ")");

        System.out.println("\nDynamic updates allow real-time adjustments without restart");

        System.out.println();
    }

    /**
     * Scenario 9: Zone-based service discovery
     * Demonstrates geographic or availability zone-based routing.
     */
    private static void demonstrateZoneBasedDiscovery() {
        System.out.println("9. Zone-Based Service Discovery");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register services in different zones
        ServiceInstance eastService1 = new ServiceInstance("cdn-service", "192.168.1.80", 80, "http");
        eastService1.addMetadata("zone", "us-east-1a");

        ServiceInstance eastService2 = new ServiceInstance("cdn-service", "192.168.1.81", 80, "http");
        eastService2.addMetadata("zone", "us-east-1b");

        ServiceInstance westService = new ServiceInstance("cdn-service", "192.168.2.80", 80, "http");
        westService.addMetadata("zone", "us-west-1a");

        registry.register(eastService1);
        registry.register(eastService2);
        registry.register(westService);

        System.out.println("Registered CDN services across multiple zones\n");

        // Client in us-east prefers local zone
        String clientZone = "us-east-1a";
        System.out.println("Client in zone: " + clientZone);
        System.out.println("Finding nearest CDN service...\n");

        List<ServiceInstance> cdnServices = registry.discover("cdn-service");
        ServiceInstance nearest = findNearestService(cdnServices, clientZone);

        if (nearest != null) {
            System.out.println("Selected: " + nearest.getHost() + " in zone " +
                             nearest.getMetadata().get("zone"));
        }

        System.out.println();
    }

    /**
     * Scenario 10: Real-world microservices ecosystem
     * Demonstrates a complete microservices system with service discovery.
     */
    private static void demonstrateRealWorldEcosystem() {
        System.out.println("10. Real-World Microservices Ecosystem");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        MicroservicesEcosystem ecosystem = new MicroservicesEcosystem(registry);

        // Initialize the ecosystem
        ecosystem.initialize();

        System.out.println("Microservices Ecosystem initialized\n");
        System.out.println("Services registered:");
        ecosystem.listAllServices();

        System.out.println("\nSimulating user request flow:");
        ecosystem.simulateUserRequest("user123");

        System.out.println("\nSimulating order placement:");
        ecosystem.simulateOrderPlacement("user123", "product456");

        System.out.println("\nCurrent system status:");
        ecosystem.printSystemStatus();

        System.out.println();
    }

    /**
     * Helper method to find the nearest service based on zone.
     */
    private static ServiceInstance findNearestService(List<ServiceInstance> instances, String clientZone) {
        // First, try to find service in the same zone
        for (ServiceInstance instance : instances) {
            if (clientZone.equals(instance.getMetadata().get("zone"))) {
                return instance;
            }
        }
        // Fall back to any available instance
        return instances.isEmpty() ? null : instances.get(0);
    }
}

/**
 * Represents a single instance of a service.
 */
class ServiceInstance {
    private final String serviceId;
    private final String host;
    private final int port;
    private final String protocol;
    private final String instanceId;
    private final Map<String, String> metadata;
    private final LocalDateTime registrationTime;
    private boolean healthy;
    private LocalDateTime lastHeartbeat;

    public ServiceInstance(String serviceId, String host, int port, String protocol) {
        this.serviceId = serviceId;
        this.host = host;
        this.port = port;
        this.protocol = protocol;
        this.instanceId = UUID.randomUUID().toString();
        this.metadata = new HashMap<>();
        this.registrationTime = LocalDateTime.now();
        this.healthy = true;
        this.lastHeartbeat = LocalDateTime.now();
    }

    public String getServiceId() { return serviceId; }
    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getProtocol() { return protocol; }
    public String getInstanceId() { return instanceId; }
    public Map<String, String> getMetadata() { return metadata; }
    public boolean isHealthy() { return healthy; }
    public void setHealthy(boolean healthy) { this.healthy = healthy; }
    public LocalDateTime getLastHeartbeat() { return lastHeartbeat; }
    public void updateHeartbeat() { this.lastHeartbeat = LocalDateTime.now(); }

    public void addMetadata(String key, String value) {
        metadata.put(key, value);
    }

    public String getUrl() {
        return protocol + "://" + host + ":" + port;
    }

    @Override
    public String toString() {
        return serviceId + " [" + getUrl() + "]";
    }
}

/**
 * Central registry for service registration and discovery.
 */
class ServiceRegistry {
    private final Map<String, List<ServiceInstance>> services;

    public ServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(ServiceInstance instance) {
        services.computeIfAbsent(instance.getServiceId(), k -> new CopyOnWriteArrayList<>())
                .add(instance);
    }

    public void deregister(String serviceId, String instanceId) {
        List<ServiceInstance> instances = services.get(serviceId);
        if (instances != null) {
            instances.removeIf(instance -> instance.getInstanceId().equals(instanceId));
        }
    }

    public List<ServiceInstance> discover(String serviceId) {
        return new ArrayList<>(services.getOrDefault(serviceId, Collections.emptyList()))
            .stream()
            .filter(ServiceInstance::isHealthy)
            .toList();
    }

    public List<String> getAllServiceIds() {
        return new ArrayList<>(services.keySet());
    }

    public void updateServiceMetadata(ServiceInstance instance) {
        // Metadata is updated directly on the instance object
        instance.updateHeartbeat();
    }
}

/**
 * Load balancer for distributing requests across service instances.
 */
class LoadBalancer {
    private final ServiceRegistry registry;
    private final Map<String, Integer> roundRobinCounters;

    public LoadBalancer(ServiceRegistry registry) {
        this.registry = registry;
        this.roundRobinCounters = new ConcurrentHashMap<>();
    }

    public ServiceInstance getNextInstance(String serviceId) {
        List<ServiceInstance> instances = registry.discover(serviceId);
        if (instances.isEmpty()) {
            return null;
        }

        int counter = roundRobinCounters.getOrDefault(serviceId, 0);
        ServiceInstance instance = instances.get(counter % instances.size());
        roundRobinCounters.put(serviceId, counter + 1);

        return instance;
    }
}

/**
 * Health checker for monitoring service health.
 */
class HealthChecker {
    private final ServiceRegistry registry;

    public HealthChecker(ServiceRegistry registry) {
        this.registry = registry;
    }

    public void performHealthChecks() {
        System.out.println("Performing health checks...");
        for (String serviceId : registry.getAllServiceIds()) {
            List<ServiceInstance> instances = registry.discover(serviceId);
            for (ServiceInstance instance : instances) {
                // In real implementation, this would make HTTP health check request
                boolean isHealthy = checkHealth(instance);
                instance.setHealthy(isHealthy);
            }
        }
    }

    private boolean checkHealth(ServiceInstance instance) {
        // Simulated health check
        return instance.isHealthy();
    }
}

/**
 * Handles failover and retry logic.
 */
class FailoverHandler {
    private final ServiceRegistry registry;
    private int currentAttempt = 0;

    public FailoverHandler(ServiceRegistry registry) {
        this.registry = registry;
    }

    public boolean callWithFailover(String serviceId, String endpoint, int maxRetries) {
        List<ServiceInstance> instances = registry.discover(serviceId);

        for (int i = 0; i < maxRetries && i < instances.size(); i++) {
            ServiceInstance instance = instances.get(i);
            System.out.println("Attempt " + (i + 1) + ": Trying " + instance.getUrl() + endpoint);

            boolean success = attemptCall(instance, endpoint);
            if (success) {
                return true;
            }

            System.out.println("  Failed, trying next instance...");
        }

        return false;
    }

    private boolean attemptCall(ServiceInstance instance, String endpoint) {
        // Simulated service call (randomly succeeds or fails)
        return Math.random() > 0.5;
    }
}

/**
 * Simulates a complete microservices ecosystem.
 */
class MicroservicesEcosystem {
    private final ServiceRegistry registry;

    public MicroservicesEcosystem(ServiceRegistry registry) {
        this.registry = registry;
    }

    public void initialize() {
        // API Gateway
        registry.register(createService("api-gateway", "192.168.1.1", 80));

        // User Services
        registry.register(createService("user-service", "192.168.1.10", 8081));
        registry.register(createService("user-service", "192.168.1.11", 8081));

        // Product Services
        registry.register(createService("product-service", "192.168.1.20", 8082));
        registry.register(createService("product-service", "192.168.1.21", 8082));

        // Order Services
        registry.register(createService("order-service", "192.168.1.30", 8083));

        // Payment Services
        registry.register(createService("payment-service", "192.168.1.40", 8084));

        // Notification Services
        registry.register(createService("notification-service", "192.168.1.50", 8085));
    }

    private ServiceInstance createService(String serviceId, String host, int port) {
        return new ServiceInstance(serviceId, host, port, "http");
    }

    public void listAllServices() {
        for (String serviceId : registry.getAllServiceIds()) {
            List<ServiceInstance> instances = registry.discover(serviceId);
            System.out.println("  " + serviceId + ": " + instances.size() + " instance(s)");
        }
    }

    public void simulateUserRequest(String userId) {
        System.out.println("1. Request -> API Gateway");
        System.out.println("2. API Gateway -> User Service (validate user)");
        System.out.println("3. User Service -> Response: User validated");
    }

    public void simulateOrderPlacement(String userId, String productId) {
        System.out.println("1. Request -> API Gateway");
        System.out.println("2. API Gateway -> Product Service (check availability)");
        System.out.println("3. API Gateway -> Order Service (create order)");
        System.out.println("4. Order Service -> Payment Service (process payment)");
        System.out.println("5. Payment Service -> Notification Service (send confirmation)");
        System.out.println("6. Response: Order placed successfully");
    }

    public void printSystemStatus() {
        System.out.println("Total services: " + registry.getAllServiceIds().size());
        int totalInstances = 0;
        for (String serviceId : registry.getAllServiceIds()) {
            totalInstances += registry.discover(serviceId).size();
        }
        System.out.println("Total instances: " + totalInstances);
        System.out.println("All services operational");
    }
}
