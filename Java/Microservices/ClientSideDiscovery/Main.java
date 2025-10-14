package Microservices.ClientSideDiscovery;

import java.util.*;
import java.util.concurrent.*;
import java.time.LocalDateTime;

/**
 * Client-Side Discovery Pattern Demonstration
 *
 * In client-side discovery, the client is responsible for determining the network locations
 * of available service instances and load balancing requests across them.
 *
 * Key Concepts:
 * - Client queries a service registry to get available service instances
 * - Client implements load balancing logic
 * - Client is responsible for handling failures and retries
 * - Examples: Netflix Eureka, Consul with client libraries
 *
 * Advantages:
 * - Fewer network hops (no load balancer intermediary)
 * - Client can implement custom load balancing strategies
 *
 * Disadvantages:
 * - Couples client with service registry
 * - Load balancing logic must be implemented in each client
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Client-Side Discovery Pattern Demo ===\n");

        // Scenario 1: Basic client-side discovery
        demonstrateBasicClientSideDiscovery();

        // Scenario 2: Client-side load balancing strategies
        demonstrateLoadBalancingStrategies();

        // Scenario 3: Service instance caching
        demonstrateServiceCaching();

        // Scenario 4: Client-side health checking
        demonstrateClientHealthChecking();

        // Scenario 5: Failover handling
        demonstrateClientFailover();

        // Scenario 6: Service registry with heartbeats
        demonstrateHeartbeatMechanism();

        // Scenario 7: Multiple service discovery
        demonstrateMultipleServiceDiscovery();

        // Scenario 8: Client-side service filtering
        demonstrateServiceFiltering();

        // Scenario 9: Weighted load balancing
        demonstrateWeightedLoadBalancing();

        // Scenario 10: Real-world e-commerce scenario
        demonstrateRealWorldScenario();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Basic client-side discovery
     * Demonstrates fundamental client-side service discovery.
     */
    private static void demonstrateBasicClientSideDiscovery() {
        System.out.println("1. Basic Client-Side Discovery");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register services
        registry.register("UserService", "192.168.1.10:8080");
        registry.register("UserService", "192.168.1.11:8080");
        registry.register("OrderService", "192.168.1.20:8080");

        System.out.println("Services registered in registry\n");

        // Client discovers and calls services
        ServiceClient client = new ServiceClient(registry);

        System.out.println("Client making requests:");
        client.callService("UserService", "/api/users/123");
        client.callService("UserService", "/api/users/456");
        client.callService("OrderService", "/api/orders/789");

        System.out.println();
    }

    /**
     * Scenario 2: Client-side load balancing strategies
     * Demonstrates different load balancing strategies implemented by clients.
     */
    private static void demonstrateLoadBalancingStrategies() {
        System.out.println("2. Client-Side Load Balancing Strategies");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register multiple instances
        registry.register("APIService", "192.168.1.10:8080");
        registry.register("APIService", "192.168.1.11:8080");
        registry.register("APIService", "192.168.1.12:8080");

        System.out.println("Testing Round-Robin strategy:");
        RoundRobinClient roundRobinClient = new RoundRobinClient(registry);
        for (int i = 0; i < 6; i++) {
            roundRobinClient.callService("APIService", "/api/data");
        }

        System.out.println("\nTesting Random strategy:");
        RandomClient randomClient = new RandomClient(registry);
        for (int i = 0; i < 4; i++) {
            randomClient.callService("APIService", "/api/data");
        }

        System.out.println();
    }

    /**
     * Scenario 3: Service instance caching
     * Demonstrates caching discovered services to reduce registry queries.
     */
    private static void demonstrateServiceCaching() {
        System.out.println("3. Service Instance Caching");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("CacheService", "192.168.1.30:8080");
        registry.register("CacheService", "192.168.1.31:8080");

        CachingClient cachingClient = new CachingClient(registry, 30); // 30 second cache

        System.out.println("First request (cache miss - queries registry):");
        cachingClient.callService("CacheService", "/api/cache/get");

        System.out.println("\nSecond request (cache hit - uses cached instances):");
        cachingClient.callService("CacheService", "/api/cache/get");

        System.out.println("\nThird request (still cached):");
        cachingClient.callService("CacheService", "/api/cache/get");

        System.out.println("\nCaching reduces load on service registry");

        System.out.println();
    }

    /**
     * Scenario 4: Client-side health checking
     * Demonstrates clients checking service health before making requests.
     */
    private static void demonstrateClientHealthChecking() {
        System.out.println("4. Client-Side Health Checking");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("HealthCheckService", "192.168.1.40:8080");
        registry.register("HealthCheckService", "192.168.1.41:8080");
        registry.register("HealthCheckService", "192.168.1.42:8080");

        HealthAwareClient healthClient = new HealthAwareClient(registry);

        System.out.println("Client performs health checks before requests:");
        healthClient.callService("HealthCheckService", "/api/process");

        System.out.println("\nClient automatically excludes unhealthy instances");
        healthClient.callService("HealthCheckService", "/api/process");

        System.out.println();
    }

    /**
     * Scenario 5: Failover handling
     * Demonstrates automatic failover when service calls fail.
     */
    private static void demonstrateClientFailover() {
        System.out.println("5. Client-Side Failover Handling");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();
        registry.register("PaymentService", "192.168.1.50:8080");
        registry.register("PaymentService", "192.168.1.51:8080");
        registry.register("PaymentService", "192.168.1.52:8080");

        FailoverClient failoverClient = new FailoverClient(registry);

        System.out.println("Attempting request with automatic failover:");
        boolean success = failoverClient.callServiceWithFailover("PaymentService", "/api/pay", 3);

        if (success) {
            System.out.println("\nRequest succeeded after failover");
        } else {
            System.out.println("\nRequest failed after all attempts");
        }

        System.out.println();
    }

    /**
     * Scenario 6: Service registry with heartbeats
     * Demonstrates heartbeat mechanism for service health monitoring.
     */
    private static void demonstrateHeartbeatMechanism() {
        System.out.println("6. Service Registry with Heartbeats");
        System.out.println("-".repeat(50));

        HeartbeatServiceRegistry heartbeatRegistry = new HeartbeatServiceRegistry();

        ServiceInstance instance1 = new ServiceInstance("NotificationService", "192.168.1.60", 8080);
        ServiceInstance instance2 = new ServiceInstance("NotificationService", "192.168.1.61", 8080);

        heartbeatRegistry.register(instance1);
        heartbeatRegistry.register(instance2);

        System.out.println("Services registered with heartbeat monitoring\n");

        // Simulate heartbeats
        System.out.println("Instance 1 sends heartbeat:");
        instance1.sendHeartbeat();

        System.out.println("Instance 2 sends heartbeat:");
        instance2.sendHeartbeat();

        System.out.println("\nHeartbeats keep services marked as healthy");
        System.out.println("Missing heartbeats would mark service as unhealthy");

        System.out.println();
    }

    /**
     * Scenario 7: Multiple service discovery
     * Demonstrates discovering and coordinating multiple services.
     */
    private static void demonstrateMultipleServiceDiscovery() {
        System.out.println("7. Multiple Service Discovery");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Register multiple service types
        registry.register("UserService", "192.168.1.70:8080");
        registry.register("ProductService", "192.168.1.71:8080");
        registry.register("InventoryService", "192.168.1.72:8080");
        registry.register("ShippingService", "192.168.1.73:8080");

        ServiceClient client = new ServiceClient(registry);

        System.out.println("Client orchestrating multiple services:");
        System.out.println("\n1. Validate user:");
        client.callService("UserService", "/api/users/validate");

        System.out.println("\n2. Check product:");
        client.callService("ProductService", "/api/products/123");

        System.out.println("\n3. Check inventory:");
        client.callService("InventoryService", "/api/inventory/123");

        System.out.println("\n4. Calculate shipping:");
        client.callService("ShippingService", "/api/shipping/calculate");

        System.out.println("\nClient coordinates multiple microservices");

        System.out.println();
    }

    /**
     * Scenario 8: Client-side service filtering
     * Demonstrates filtering services based on metadata or attributes.
     */
    private static void demonstrateServiceFiltering() {
        System.out.println("8. Client-Side Service Filtering");
        System.out.println("-".repeat(50));

        MetadataServiceRegistry metadataRegistry = new MetadataServiceRegistry();

        ServiceInstanceWithMetadata db1 = new ServiceInstanceWithMetadata("DatabaseService", "192.168.1.80", 5432);
        db1.addMetadata("region", "us-east");
        db1.addMetadata("type", "read-replica");

        ServiceInstanceWithMetadata db2 = new ServiceInstanceWithMetadata("DatabaseService", "192.168.1.81", 5432);
        db2.addMetadata("region", "us-west");
        db2.addMetadata("type", "read-replica");

        ServiceInstanceWithMetadata db3 = new ServiceInstanceWithMetadata("DatabaseService", "192.168.1.82", 5432);
        db3.addMetadata("region", "us-east");
        db3.addMetadata("type", "primary");

        metadataRegistry.register(db1);
        metadataRegistry.register(db2);
        metadataRegistry.register(db3);

        FilteringClient filteringClient = new FilteringClient(metadataRegistry);

        System.out.println("Finding DatabaseService in us-east region:");
        filteringClient.callServiceWithFilter("DatabaseService", "/api/query", "region", "us-east");

        System.out.println("\nFinding primary DatabaseService:");
        filteringClient.callServiceWithFilter("DatabaseService", "/api/query", "type", "primary");

        System.out.println();
    }

    /**
     * Scenario 9: Weighted load balancing
     * Demonstrates distributing load based on instance weights/capacity.
     */
    private static void demonstrateWeightedLoadBalancing() {
        System.out.println("9. Weighted Load Balancing");
        System.out.println("-".repeat(50));

        WeightedServiceRegistry weightedRegistry = new WeightedServiceRegistry();

        WeightedServiceInstance heavy = new WeightedServiceInstance("ComputeService", "192.168.1.90", 8080, 10);
        WeightedServiceInstance medium = new WeightedServiceInstance("ComputeService", "192.168.1.91", 8080, 5);
        WeightedServiceInstance light = new WeightedServiceInstance("ComputeService", "192.168.1.92", 8080, 1);

        weightedRegistry.register(heavy);
        weightedRegistry.register(medium);
        weightedRegistry.register(light);

        WeightedLoadBalancingClient weightedClient = new WeightedLoadBalancingClient(weightedRegistry);

        System.out.println("Distributing 16 requests based on weights:");
        System.out.println("Instance 1 (weight=10), Instance 2 (weight=5), Instance 3 (weight=1)\n");

        Map<String, Integer> requestCounts = new HashMap<>();
        for (int i = 0; i < 16; i++) {
            String instance = weightedClient.callService("ComputeService", "/api/compute");
            requestCounts.put(instance, requestCounts.getOrDefault(instance, 0) + 1);
        }

        System.out.println("\nRequest distribution:");
        requestCounts.forEach((instance, count) ->
            System.out.println(instance + ": " + count + " requests"));

        System.out.println();
    }

    /**
     * Scenario 10: Real-world e-commerce scenario
     * Demonstrates complete client-side discovery in an e-commerce application.
     */
    private static void demonstrateRealWorldScenario() {
        System.out.println("10. Real-World E-Commerce Scenario");
        System.out.println("-".repeat(50));

        ServiceRegistry registry = new ServiceRegistry();

        // Setup services
        registry.register("UserService", "192.168.1.100:8080");
        registry.register("UserService", "192.168.1.101:8080");
        registry.register("ProductCatalogService", "192.168.1.110:8080");
        registry.register("ProductCatalogService", "192.168.1.111:8080");
        registry.register("ShoppingCartService", "192.168.1.120:8080");
        registry.register("OrderService", "192.168.1.130:8080");
        registry.register("PaymentService", "192.168.1.140:8080");
        registry.register("NotificationService", "192.168.1.150:8080");

        ECommerceClient ecommerceClient = new ECommerceClient(registry);

        System.out.println("Simulating complete shopping flow:\n");
        ecommerceClient.processCheckout("user456", "cart789");

        System.out.println("\nClient-side discovery enables microservices coordination");

        System.out.println();
    }
}

/**
 * Service registry for storing and retrieving service locations.
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

    public List<String> discover(String serviceName) {
        return new ArrayList<>(services.getOrDefault(serviceName, Collections.emptyList()));
    }

    public void deregister(String serviceName, String location) {
        List<String> instances = services.get(serviceName);
        if (instances != null) {
            instances.remove(location);
        }
    }
}

/**
 * Basic service client with round-robin load balancing.
 */
class ServiceClient {
    protected final ServiceRegistry registry;
    private final Map<String, Integer> counters;

    public ServiceClient(ServiceRegistry registry) {
        this.registry = registry;
        this.counters = new ConcurrentHashMap<>();
    }

    public void callService(String serviceName, String endpoint) {
        List<String> instances = registry.discover(serviceName);
        if (instances.isEmpty()) {
            System.out.println("No instances available for " + serviceName);
            return;
        }

        int counter = counters.getOrDefault(serviceName, 0);
        String instance = instances.get(counter % instances.size());
        counters.put(serviceName, counter + 1);

        System.out.println("Calling " + serviceName + " at " + instance + endpoint);
    }
}

/**
 * Client with round-robin load balancing strategy.
 */
class RoundRobinClient extends ServiceClient {
    public RoundRobinClient(ServiceRegistry registry) {
        super(registry);
    }
}

/**
 * Client with random load balancing strategy.
 */
class RandomClient extends ServiceClient {
    private final Random random;

    public RandomClient(ServiceRegistry registry) {
        super(registry);
        this.random = new Random();
    }

    @Override
    public void callService(String serviceName, String endpoint) {
        List<String> instances = registry.discover(serviceName);
        if (instances.isEmpty()) {
            System.out.println("No instances available for " + serviceName);
            return;
        }

        String instance = instances.get(random.nextInt(instances.size()));
        System.out.println("Calling " + serviceName + " at " + instance + endpoint + " (random)");
    }
}

/**
 * Client that caches discovered service instances.
 */
class CachingClient extends ServiceClient {
    private final Map<String, CachedServiceList> cache;
    private final int cacheDurationSeconds;

    public CachingClient(ServiceRegistry registry, int cacheDurationSeconds) {
        super(registry);
        this.cache = new ConcurrentHashMap<>();
        this.cacheDurationSeconds = cacheDurationSeconds;
    }

    @Override
    public void callService(String serviceName, String endpoint) {
        List<String> instances = getCachedInstances(serviceName);
        if (instances.isEmpty()) {
            System.out.println("No instances available for " + serviceName);
            return;
        }

        String instance = instances.get(0);
        System.out.println("Calling " + serviceName + " at " + instance + endpoint);
    }

    private List<String> getCachedInstances(String serviceName) {
        CachedServiceList cached = cache.get(serviceName);

        if (cached != null && !cached.isExpired(cacheDurationSeconds)) {
            System.out.println("  [Using cached instances]");
            return cached.getInstances();
        }

        System.out.println("  [Querying registry - cache miss]");
        List<String> instances = registry.discover(serviceName);
        cache.put(serviceName, new CachedServiceList(instances));
        return instances;
    }
}

/**
 * Helper class for caching service instances.
 */
class CachedServiceList {
    private final List<String> instances;
    private final LocalDateTime cachedAt;

    public CachedServiceList(List<String> instances) {
        this.instances = new ArrayList<>(instances);
        this.cachedAt = LocalDateTime.now();
    }

    public List<String> getInstances() {
        return instances;
    }

    public boolean isExpired(int seconds) {
        return LocalDateTime.now().isAfter(cachedAt.plusSeconds(seconds));
    }
}

/**
 * Client that checks service health before making calls.
 */
class HealthAwareClient extends ServiceClient {
    private final Set<String> unhealthyInstances;

    public HealthAwareClient(ServiceRegistry registry) {
        super(registry);
        this.unhealthyInstances = ConcurrentHashMap.newKeySet();
    }

    @Override
    public void callService(String serviceName, String endpoint) {
        List<String> instances = registry.discover(serviceName);
        List<String> healthyInstances = instances.stream()
            .filter(instance -> !unhealthyInstances.contains(instance))
            .toList();

        if (healthyInstances.isEmpty()) {
            System.out.println("No healthy instances available for " + serviceName);
            return;
        }

        String instance = healthyInstances.get(0);

        // Simulate health check
        if (performHealthCheck(instance)) {
            System.out.println("Calling " + serviceName + " at " + instance + endpoint + " (healthy)");
        } else {
            unhealthyInstances.add(instance);
            System.out.println("Instance " + instance + " is unhealthy, marked for exclusion");
        }
    }

    private boolean performHealthCheck(String instance) {
        // Simulated health check
        return Math.random() > 0.2;
    }
}

/**
 * Client with automatic failover capabilities.
 */
class FailoverClient extends ServiceClient {
    public FailoverClient(ServiceRegistry registry) {
        super(registry);
    }

    public boolean callServiceWithFailover(String serviceName, String endpoint, int maxAttempts) {
        List<String> instances = registry.discover(serviceName);

        for (int i = 0; i < maxAttempts && i < instances.size(); i++) {
            String instance = instances.get(i);
            System.out.println("Attempt " + (i + 1) + ": Calling " + instance + endpoint);

            if (attemptCall(instance)) {
                System.out.println("  Success!");
                return true;
            }
            System.out.println("  Failed, trying next instance...");
        }

        return false;
    }

    private boolean attemptCall(String instance) {
        // Simulate random success/failure
        return Math.random() > 0.6;
    }
}

/**
 * Service instance with heartbeat capability.
 */
class ServiceInstance {
    private final String serviceName;
    private final String host;
    private final int port;
    private LocalDateTime lastHeartbeat;

    public ServiceInstance(String serviceName, String host, int port) {
        this.serviceName = serviceName;
        this.host = host;
        this.port = port;
        this.lastHeartbeat = LocalDateTime.now();
    }

    public void sendHeartbeat() {
        this.lastHeartbeat = LocalDateTime.now();
        System.out.println("  Heartbeat from " + host + ":" + port + " at " + lastHeartbeat);
    }

    public String getLocation() {
        return host + ":" + port;
    }

    public LocalDateTime getLastHeartbeat() {
        return lastHeartbeat;
    }
}

/**
 * Service registry with heartbeat monitoring.
 */
class HeartbeatServiceRegistry {
    private final Map<String, List<ServiceInstance>> services;

    public HeartbeatServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(ServiceInstance instance) {
        services.computeIfAbsent(instance.serviceName, k -> new CopyOnWriteArrayList<>()).add(instance);
        System.out.println("Registered with heartbeat: " + instance.getLocation());
    }

    public List<ServiceInstance> discover(String serviceName) {
        return services.getOrDefault(serviceName, Collections.emptyList());
    }
}

/**
 * Service instance with metadata.
 */
class ServiceInstanceWithMetadata {
    private final String serviceName;
    private final String host;
    private final int port;
    private final Map<String, String> metadata;

    public ServiceInstanceWithMetadata(String serviceName, String host, int port) {
        this.serviceName = serviceName;
        this.host = host;
        this.port = port;
        this.metadata = new HashMap<>();
    }

    public void addMetadata(String key, String value) {
        metadata.put(key, value);
    }

    public String getMetadata(String key) {
        return metadata.get(key);
    }

    public String getLocation() {
        return host + ":" + port;
    }

    public String getServiceName() {
        return serviceName;
    }
}

/**
 * Service registry with metadata support.
 */
class MetadataServiceRegistry {
    private final Map<String, List<ServiceInstanceWithMetadata>> services;

    public MetadataServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(ServiceInstanceWithMetadata instance) {
        services.computeIfAbsent(instance.getServiceName(), k -> new CopyOnWriteArrayList<>()).add(instance);
        System.out.println("Registered with metadata: " + instance.getLocation());
    }

    public List<ServiceInstanceWithMetadata> discover(String serviceName) {
        return services.getOrDefault(serviceName, Collections.emptyList());
    }
}

/**
 * Client that filters services based on metadata.
 */
class FilteringClient {
    private final MetadataServiceRegistry registry;

    public FilteringClient(MetadataServiceRegistry registry) {
        this.registry = registry;
    }

    public void callServiceWithFilter(String serviceName, String endpoint, String metadataKey, String metadataValue) {
        List<ServiceInstanceWithMetadata> instances = registry.discover(serviceName);

        List<ServiceInstanceWithMetadata> filtered = instances.stream()
            .filter(instance -> metadataValue.equals(instance.getMetadata(metadataKey)))
            .toList();

        if (filtered.isEmpty()) {
            System.out.println("No instances match filter: " + metadataKey + "=" + metadataValue);
            return;
        }

        ServiceInstanceWithMetadata instance = filtered.get(0);
        System.out.println("Calling " + instance.getLocation() + endpoint +
                         " (filtered by " + metadataKey + "=" + metadataValue + ")");
    }
}

/**
 * Weighted service instance for capacity-based load balancing.
 */
class WeightedServiceInstance {
    private final String serviceName;
    private final String host;
    private final int port;
    private final int weight;

    public WeightedServiceInstance(String serviceName, String host, int port, int weight) {
        this.serviceName = serviceName;
        this.host = host;
        this.port = port;
        this.weight = weight;
    }

    public String getLocation() {
        return host + ":" + port;
    }

    public int getWeight() {
        return weight;
    }

    public String getServiceName() {
        return serviceName;
    }
}

/**
 * Service registry for weighted instances.
 */
class WeightedServiceRegistry {
    private final Map<String, List<WeightedServiceInstance>> services;

    public WeightedServiceRegistry() {
        this.services = new ConcurrentHashMap<>();
    }

    public void register(WeightedServiceInstance instance) {
        services.computeIfAbsent(instance.getServiceName(), k -> new CopyOnWriteArrayList<>()).add(instance);
        System.out.println("Registered: " + instance.getLocation() + " (weight=" + instance.getWeight() + ")");
    }

    public List<WeightedServiceInstance> discover(String serviceName) {
        return services.getOrDefault(serviceName, Collections.emptyList());
    }
}

/**
 * Client with weighted load balancing.
 */
class WeightedLoadBalancingClient {
    private final WeightedServiceRegistry registry;
    private final Random random;

    public WeightedLoadBalancingClient(WeightedServiceRegistry registry) {
        this.registry = registry;
        this.random = new Random();
    }

    public String callService(String serviceName, String endpoint) {
        List<WeightedServiceInstance> instances = registry.discover(serviceName);
        if (instances.isEmpty()) {
            return null;
        }

        WeightedServiceInstance selected = selectByWeight(instances);
        System.out.println("Calling " + selected.getLocation() + endpoint);
        return selected.getLocation();
    }

    private WeightedServiceInstance selectByWeight(List<WeightedServiceInstance> instances) {
        int totalWeight = instances.stream().mapToInt(WeightedServiceInstance::getWeight).sum();
        int randomValue = random.nextInt(totalWeight);

        int cumulative = 0;
        for (WeightedServiceInstance instance : instances) {
            cumulative += instance.getWeight();
            if (randomValue < cumulative) {
                return instance;
            }
        }

        return instances.get(instances.size() - 1);
    }
}

/**
 * E-commerce client demonstrating real-world usage.
 */
class ECommerceClient {
    private final ServiceClient client;

    public ECommerceClient(ServiceRegistry registry) {
        this.client = new ServiceClient(registry);
    }

    public void processCheckout(String userId, String cartId) {
        System.out.println("Step 1: Validate user");
        client.callService("UserService", "/api/users/" + userId + "/validate");

        System.out.println("\nStep 2: Get cart details");
        client.callService("ShoppingCartService", "/api/carts/" + cartId);

        System.out.println("\nStep 3: Check product availability");
        client.callService("ProductCatalogService", "/api/products/availability");

        System.out.println("\nStep 4: Create order");
        client.callService("OrderService", "/api/orders/create");

        System.out.println("\nStep 5: Process payment");
        client.callService("PaymentService", "/api/payments/process");

        System.out.println("\nStep 6: Send confirmation");
        client.callService("NotificationService", "/api/notifications/send");

        System.out.println("\nCheckout completed successfully!");
    }
}
