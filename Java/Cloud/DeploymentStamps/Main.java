package Cloud.DeploymentStamps;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.time.Instant;
import java.time.Duration;

/**
 * DeploymentStamps Pattern Demonstration
 *
 * This pattern deploys multiple independent copies (stamps) of application components
 * to achieve scalability, reliability, and geographic distribution. It demonstrates:
 * - Stamp-based deployment architecture
 * - Geographic distribution of stamps
 * - Independent stamp lifecycle management
 * - Load balancing across stamps
 * - Stamp-level isolation and fault tolerance
 * - Capacity management per stamp
 * - Multi-region deployment
 * - Stamp versioning and rollout
 *
 * Key Benefits:
 * - Improved scalability through horizontal deployment
 * - Better fault isolation
 * - Geographic proximity to users
 * - Simplified rollout and rollback
 *
 * @author Design Patterns Collection
 * @version 2.0
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== DeploymentStamps Pattern Demo ===\n");

        // Scenario 1: Basic Stamp Deployment
        demonstrateBasicStampDeployment();

        // Scenario 2: Geographic Distribution
        demonstrateGeographicDistribution();

        // Scenario 3: Load Balancing Across Stamps
        demonstrateLoadBalancing();

        // Scenario 4: Stamp Isolation and Fault Tolerance
        demonstrateStampIsolation();

        // Scenario 5: Capacity Management Per Stamp
        demonstrateCapacityManagement();

        // Scenario 6: Rolling Deployment Across Stamps
        demonstrateRollingDeployment();

        // Scenario 7: Multi-Tenant Stamp Assignment
        demonstrateMultiTenantStamps();

        // Scenario 8: Stamp Health Monitoring
        demonstrateHealthMonitoring();

        // Scenario 9: Stamp Versioning and Blue-Green Deployment
        demonstrateBlueGreenDeployment();

        // Scenario 10: Async Request Processing with Stamp Affinity
        demonstrateStampAffinity();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Demonstrates basic stamp deployment with multiple independent instances
     */
    private static void demonstrateBasicStampDeployment() {
        System.out.println("Scenario 1: Basic Stamp Deployment");
        System.out.println("----------------------------------");

        StampManager manager = new StampManager();

        // Deploy multiple stamps
        DeploymentStamp stamp1 = manager.deployStamp("Stamp-1", Region.US_EAST);
        DeploymentStamp stamp2 = manager.deployStamp("Stamp-2", Region.US_WEST);
        DeploymentStamp stamp3 = manager.deployStamp("Stamp-3", Region.EU_WEST);

        // Process requests on different stamps
        stamp1.processRequest(new Request("req1", "user1"));
        stamp2.processRequest(new Request("req2", "user2"));
        stamp3.processRequest(new Request("req3", "user3"));

        manager.printStampStatus();
        System.out.println();
    }

    /**
     * Scenario 2: Demonstrates geographic distribution of stamps for global reach
     */
    private static void demonstrateGeographicDistribution() throws InterruptedException {
        System.out.println("Scenario 2: Geographic Distribution");
        System.out.println("-----------------------------------");

        GeographicStampManager geoManager = new GeographicStampManager();

        // Deploy stamps in multiple regions
        geoManager.deployRegionalStamp(Region.US_EAST, 2);
        geoManager.deployRegionalStamp(Region.EU_WEST, 2);
        geoManager.deployRegionalStamp(Region.ASIA_PACIFIC, 1);

        // Route requests based on user location
        geoManager.routeRequest(new UserLocation(40.7128, -74.0060), new Request("req1", "user-us"));
        geoManager.routeRequest(new UserLocation(51.5074, -0.1278), new Request("req2", "user-uk"));
        geoManager.routeRequest(new UserLocation(35.6762, 139.6503), new Request("req3", "user-jp"));

        Thread.sleep(200);
        geoManager.printRegionalStats();
        System.out.println();
    }

    /**
     * Scenario 3: Demonstrates load balancing across multiple stamps
     */
    private static void demonstrateLoadBalancing() throws InterruptedException {
        System.out.println("Scenario 3: Load Balancing Across Stamps");
        System.out.println("----------------------------------------");

        LoadBalancedStampCluster cluster = new LoadBalancedStampCluster(4);

        // Submit multiple requests that will be balanced
        for (int i = 0; i < 16; i++) {
            cluster.submitRequest(new Request("req-" + i, "user-" + i));
        }

        Thread.sleep(500);
        cluster.printLoadDistribution();
        System.out.println();
    }

    /**
     * Scenario 4: Demonstrates stamp isolation and fault tolerance
     */
    private static void demonstrateStampIsolation() throws InterruptedException {
        System.out.println("Scenario 4: Stamp Isolation and Fault Tolerance");
        System.out.println("-----------------------------------------------");

        FaultTolerantStampManager ftManager = new FaultTolerantStampManager();

        ftManager.addStamp("Stamp-A", Region.US_EAST, StampStatus.HEALTHY);
        ftManager.addStamp("Stamp-B", Region.US_WEST, StampStatus.HEALTHY);
        ftManager.addStamp("Stamp-C", Region.EU_WEST, StampStatus.DEGRADED);

        // Process requests with automatic failover
        for (int i = 0; i < 10; i++) {
            ftManager.processWithFailover(new Request("req-" + i, "user-" + i));
        }

        Thread.sleep(300);
        ftManager.printFaultStats();
        System.out.println();
    }

    /**
     * Scenario 5: Demonstrates capacity management per stamp
     */
    private static void demonstrateCapacityManagement() throws InterruptedException {
        System.out.println("Scenario 5: Capacity Management Per Stamp");
        System.out.println("-----------------------------------------");

        CapacityManagedStamp stamp = new CapacityManagedStamp("CapacityStamp", 5, 10);

        // Submit requests up to capacity
        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            CompletableFuture<String> future = stamp.submitRequestAsync(
                new Request("req-" + i, "user-" + i)
            );
            futures.add(future);
        }

        // Wait for completion
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        stamp.printCapacityStats();
        System.out.println();
    }

    /**
     * Scenario 6: Demonstrates rolling deployment across stamps
     */
    private static void demonstrateRollingDeployment() throws InterruptedException {
        System.out.println("Scenario 6: Rolling Deployment Across Stamps");
        System.out.println("--------------------------------------------");

        RollingDeploymentManager rolloutManager = new RollingDeploymentManager();

        // Add stamps with old version
        rolloutManager.addStamp("Stamp-1", "v1.0");
        rolloutManager.addStamp("Stamp-2", "v1.0");
        rolloutManager.addStamp("Stamp-3", "v1.0");
        rolloutManager.addStamp("Stamp-4", "v1.0");

        System.out.println("Initial deployment:");
        rolloutManager.printVersionDistribution();

        // Rolling update to new version
        rolloutManager.rollingUpdate("v2.0", 2);

        System.out.println("\nAfter rolling update:");
        rolloutManager.printVersionDistribution();
        System.out.println();
    }

    /**
     * Scenario 7: Demonstrates multi-tenant stamp assignment
     */
    private static void demonstrateMultiTenantStamps() throws InterruptedException {
        System.out.println("Scenario 7: Multi-Tenant Stamp Assignment");
        System.out.println("-----------------------------------------");

        MultiTenantStampManager mtManager = new MultiTenantStampManager();

        // Assign tenants to stamps
        mtManager.assignTenantToStamp("TenantA", "Stamp-1");
        mtManager.assignTenantToStamp("TenantB", "Stamp-1");
        mtManager.assignTenantToStamp("TenantC", "Stamp-2");
        mtManager.assignTenantToStamp("TenantD", "Stamp-3");

        // Process tenant requests
        mtManager.processTenantRequest("TenantA", new Request("req1", "userA"));
        mtManager.processTenantRequest("TenantB", new Request("req2", "userB"));
        mtManager.processTenantRequest("TenantC", new Request("req3", "userC"));

        Thread.sleep(200);
        mtManager.printTenantDistribution();
        System.out.println();
    }

    /**
     * Scenario 8: Demonstrates stamp health monitoring
     */
    private static void demonstrateHealthMonitoring() throws InterruptedException {
        System.out.println("Scenario 8: Stamp Health Monitoring");
        System.out.println("-----------------------------------");

        HealthMonitoredStampCluster cluster = new HealthMonitoredStampCluster();

        cluster.addStamp("Stamp-1");
        cluster.addStamp("Stamp-2");
        cluster.addStamp("Stamp-3");

        // Start health monitoring
        cluster.startHealthChecks(500);

        // Simulate stamp health changes
        Thread.sleep(600);
        cluster.simulateHealthChange("Stamp-2", StampStatus.DEGRADED);

        Thread.sleep(600);
        cluster.printHealthReport();
        cluster.stopHealthChecks();
        System.out.println();
    }

    /**
     * Scenario 9: Demonstrates blue-green deployment with stamp versioning
     */
    private static void demonstrateBlueGreenDeployment() throws InterruptedException {
        System.out.println("Scenario 9: Blue-Green Deployment");
        System.out.println("---------------------------------");

        BlueGreenStampManager bgManager = new BlueGreenStampManager();

        // Set up blue environment (current production)
        bgManager.deployBlueEnvironment("v1.0", 3);
        System.out.println("Blue environment (v1.0) deployed");

        // Deploy green environment (new version)
        bgManager.deployGreenEnvironment("v2.0", 3);
        System.out.println("Green environment (v2.0) deployed");

        // Route some traffic to green for testing
        bgManager.routeTrafficPercentage(10);
        System.out.println("Routing 10% traffic to green environment");

        Thread.sleep(200);

        // Switch all traffic to green
        bgManager.switchToGreen();
        System.out.println("Switched all traffic to green environment (v2.0)");

        bgManager.printDeploymentStatus();
        System.out.println();
    }

    /**
     * Scenario 10: Demonstrates async request processing with stamp affinity
     */
    private static void demonstrateStampAffinity() throws InterruptedException {
        System.out.println("Scenario 10: Async Request Processing with Stamp Affinity");
        System.out.println("---------------------------------------------------------");

        AffinityBasedStampRouter router = new AffinityBasedStampRouter(4);

        // Submit requests with session affinity
        List<CompletableFuture<String>> futures = new ArrayList<>();
        String[] sessionIds = {"session-A", "session-B", "session-C", "session-A", "session-B"};

        for (int i = 0; i < sessionIds.length; i++) {
            String sessionId = sessionIds[i];
            CompletableFuture<String> future = router.routeWithAffinity(
                sessionId,
                new Request("req-" + i, "user-" + i)
            );
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        router.printAffinityStats();
        System.out.println();
    }
}

/**
 * Enumeration of deployment regions
 */
enum Region {
    US_EAST("us-east-1"),
    US_WEST("us-west-1"),
    EU_WEST("eu-west-1"),
    ASIA_PACIFIC("ap-southeast-1");

    private final String code;

    Region(String code) {
        this.code = code;
    }

    public String getCode() { return code; }
}

/**
 * Enumeration of stamp health status
 */
enum StampStatus {
    HEALTHY,
    DEGRADED,
    UNHEALTHY,
    MAINTENANCE
}

/**
 * Represents a deployment stamp (independent application instance)
 */
class DeploymentStamp {
    private final String id;
    private final Region region;
    private final Instant deployedAt;
    private final AtomicInteger requestCount;
    private final ExecutorService executor;
    private StampStatus status;
    private String version;

    public DeploymentStamp(String id, Region region) {
        this(id, region, "v1.0");
    }

    public DeploymentStamp(String id, Region region, String version) {
        this.id = id;
        this.region = region;
        this.version = version;
        this.deployedAt = Instant.now();
        this.requestCount = new AtomicInteger(0);
        this.executor = Executors.newFixedThreadPool(4);
        this.status = StampStatus.HEALTHY;
    }

    public void processRequest(Request request) {
        executor.submit(() -> {
            try {
                requestCount.incrementAndGet();
                Thread.sleep(50); // Simulate processing
                System.out.println("[" + id + "] Processed: " + request.getId() +
                                 " in region " + region.getCode());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }

    public CompletableFuture<String> processRequestAsync(Request request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                requestCount.incrementAndGet();
                Thread.sleep(50);
                return "[" + id + "] Processed: " + request.getId();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return "[" + id + "] Failed: " + request.getId();
            }
        }, executor);
    }

    public String getId() { return id; }
    public Region getRegion() { return region; }
    public int getRequestCount() { return requestCount.get(); }
    public StampStatus getStatus() { return status; }
    public void setStatus(StampStatus status) { this.status = status; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public Instant getDeployedAt() { return deployedAt; }

    public void shutdown() {
        executor.shutdown();
    }
}

/**
 * Represents a user request
 */
class Request {
    private final String id;
    private final String userId;
    private final Instant timestamp;

    public Request(String id, String userId) {
        this.id = id;
        this.userId = userId;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public Instant getTimestamp() { return timestamp; }
}

/**
 * Represents user geographic location
 */
class UserLocation {
    private final double latitude;
    private final double longitude;

    public UserLocation(double latitude, double longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }

    public Region findNearestRegion() {
        // Simplified logic for demonstration
        if (longitude < -50) return Region.US_EAST;
        if (longitude < 0) return Region.EU_WEST;
        return Region.ASIA_PACIFIC;
    }
}

/**
 * Basic stamp manager
 */
class StampManager {
    private final Map<String, DeploymentStamp> stamps;

    public StampManager() {
        this.stamps = new ConcurrentHashMap<>();
    }

    public DeploymentStamp deployStamp(String id, Region region) {
        DeploymentStamp stamp = new DeploymentStamp(id, region);
        stamps.put(id, stamp);
        System.out.println("Deployed stamp: " + id + " in region " + region.getCode());
        return stamp;
    }

    public void printStampStatus() {
        System.out.println("\nStamp Status:");
        stamps.values().forEach(stamp ->
            System.out.println("  " + stamp.getId() + " (" + stamp.getRegion().getCode() +
                             "): " + stamp.getRequestCount() + " requests")
        );
    }
}

/**
 * Geographic stamp manager with region-based routing
 */
class GeographicStampManager {
    private final Map<Region, List<DeploymentStamp>> regionalStamps;
    private final AtomicInteger stampCounter;

    public GeographicStampManager() {
        this.regionalStamps = new ConcurrentHashMap<>();
        this.stampCounter = new AtomicInteger(0);
    }

    public void deployRegionalStamp(Region region, int count) {
        regionalStamps.putIfAbsent(region, Collections.synchronizedList(new ArrayList<>()));
        List<DeploymentStamp> stamps = regionalStamps.get(region);

        for (int i = 0; i < count; i++) {
            String id = region.getCode() + "-stamp-" + stampCounter.incrementAndGet();
            DeploymentStamp stamp = new DeploymentStamp(id, region);
            stamps.add(stamp);
            System.out.println("Deployed stamp: " + id);
        }
    }

    public void routeRequest(UserLocation location, Request request) {
        Region nearestRegion = location.findNearestRegion();
        List<DeploymentStamp> stamps = regionalStamps.get(nearestRegion);

        if (stamps != null && !stamps.isEmpty()) {
            DeploymentStamp stamp = stamps.get(request.getId().hashCode() % stamps.size());
            stamp.processRequest(request);
        }
    }

    public void printRegionalStats() {
        System.out.println("\nRegional Statistics:");
        regionalStamps.forEach((region, stamps) -> {
            int totalRequests = stamps.stream()
                .mapToInt(DeploymentStamp::getRequestCount)
                .sum();
            System.out.println("  " + region.getCode() + ": " + stamps.size() +
                             " stamps, " + totalRequests + " requests");
        });
    }
}

/**
 * Load-balanced stamp cluster
 */
class LoadBalancedStampCluster {
    private final List<DeploymentStamp> stamps;
    private final AtomicInteger roundRobinIndex;

    public LoadBalancedStampCluster(int stampCount) {
        this.stamps = new ArrayList<>();
        this.roundRobinIndex = new AtomicInteger(0);

        for (int i = 0; i < stampCount; i++) {
            stamps.add(new DeploymentStamp("LB-Stamp-" + i, Region.US_EAST));
        }
    }

    public void submitRequest(Request request) {
        int index = Math.abs(roundRobinIndex.getAndIncrement() % stamps.size());
        stamps.get(index).processRequest(request);
    }

    public void printLoadDistribution() {
        System.out.println("\nLoad Distribution:");
        stamps.forEach(stamp ->
            System.out.println("  " + stamp.getId() + ": " + stamp.getRequestCount() + " requests")
        );
    }
}

/**
 * Fault-tolerant stamp manager with automatic failover
 */
class FaultTolerantStampManager {
    private final List<DeploymentStamp> stamps;
    private final AtomicInteger failoverCount;

    public FaultTolerantStampManager() {
        this.stamps = Collections.synchronizedList(new ArrayList<>());
        this.failoverCount = new AtomicInteger(0);
    }

    public void addStamp(String id, Region region, StampStatus status) {
        DeploymentStamp stamp = new DeploymentStamp(id, region);
        stamp.setStatus(status);
        stamps.add(stamp);
    }

    public void processWithFailover(Request request) {
        DeploymentStamp healthyStamp = findHealthyStamp();

        if (healthyStamp != null) {
            healthyStamp.processRequest(request);
        } else {
            failoverCount.incrementAndGet();
            System.out.println("No healthy stamp available for request: " + request.getId());
        }
    }

    private DeploymentStamp findHealthyStamp() {
        return stamps.stream()
            .filter(stamp -> stamp.getStatus() == StampStatus.HEALTHY)
            .findFirst()
            .orElse(stamps.stream()
                .filter(stamp -> stamp.getStatus() == StampStatus.DEGRADED)
                .findFirst()
                .orElse(null));
    }

    public void printFaultStats() {
        System.out.println("\nFault Tolerance Statistics:");
        stamps.forEach(stamp ->
            System.out.println("  " + stamp.getId() + " (" + stamp.getStatus() +
                             "): " + stamp.getRequestCount() + " requests")
        );
        System.out.println("  Total failovers: " + failoverCount.get());
    }
}

/**
 * Capacity-managed stamp with queue and throttling
 */
class CapacityManagedStamp {
    private final DeploymentStamp stamp;
    private final Semaphore capacitySemaphore;
    private final int maxCapacity;
    private final AtomicInteger queuedRequests;
    private final AtomicInteger rejectedRequests;

    public CapacityManagedStamp(String id, int currentCapacity, int maxCapacity) {
        this.stamp = new DeploymentStamp(id, Region.US_EAST);
        this.capacitySemaphore = new Semaphore(currentCapacity);
        this.maxCapacity = maxCapacity;
        this.queuedRequests = new AtomicInteger(0);
        this.rejectedRequests = new AtomicInteger(0);
    }

    public CompletableFuture<String> submitRequestAsync(Request request) {
        if (capacitySemaphore.tryAcquire()) {
            return stamp.processRequestAsync(request)
                .whenComplete((result, error) -> capacitySemaphore.release());
        } else {
            rejectedRequests.incrementAndGet();
            System.out.println("Request " + request.getId() + " rejected - capacity limit reached");
            return CompletableFuture.completedFuture("Rejected: " + request.getId());
        }
    }

    public void printCapacityStats() {
        System.out.println("\nCapacity Statistics:");
        System.out.println("  Max capacity: " + maxCapacity);
        System.out.println("  Available permits: " + capacitySemaphore.availablePermits());
        System.out.println("  Processed requests: " + stamp.getRequestCount());
        System.out.println("  Rejected requests: " + rejectedRequests.get());
    }
}

/**
 * Rolling deployment manager
 */
class RollingDeploymentManager {
    private final List<DeploymentStamp> stamps;

    public RollingDeploymentManager() {
        this.stamps = Collections.synchronizedList(new ArrayList<>());
    }

    public void addStamp(String id, String version) {
        DeploymentStamp stamp = new DeploymentStamp(id, Region.US_EAST, version);
        stamps.add(stamp);
    }

    public void rollingUpdate(String newVersion, int batchSize) throws InterruptedException {
        System.out.println("\nStarting rolling update to " + newVersion);

        for (int i = 0; i < stamps.size(); i += batchSize) {
            int endIndex = Math.min(i + batchSize, stamps.size());
            List<DeploymentStamp> batch = stamps.subList(i, endIndex);

            System.out.println("Updating batch " + (i / batchSize + 1) + "...");
            for (DeploymentStamp stamp : batch) {
                stamp.setVersion(newVersion);
                System.out.println("  " + stamp.getId() + " updated to " + newVersion);
            }

            Thread.sleep(200); // Simulate deployment time
        }

        System.out.println("Rolling update complete");
    }

    public void printVersionDistribution() {
        Map<String, Long> versionCounts = new HashMap<>();
        stamps.forEach(stamp -> {
            String version = stamp.getVersion();
            versionCounts.put(version, versionCounts.getOrDefault(version, 0L) + 1);
        });

        versionCounts.forEach((version, count) ->
            System.out.println("  Version " + version + ": " + count + " stamps")
        );
    }
}

/**
 * Multi-tenant stamp manager
 */
class MultiTenantStampManager {
    private final Map<String, DeploymentStamp> stamps;
    private final Map<String, String> tenantToStamp;

    public MultiTenantStampManager() {
        this.stamps = new ConcurrentHashMap<>();
        this.tenantToStamp = new ConcurrentHashMap<>();
    }

    public void assignTenantToStamp(String tenantId, String stampId) {
        stamps.putIfAbsent(stampId, new DeploymentStamp(stampId, Region.US_EAST));
        tenantToStamp.put(tenantId, stampId);
        System.out.println("Assigned " + tenantId + " to " + stampId);
    }

    public void processTenantRequest(String tenantId, Request request) {
        String stampId = tenantToStamp.get(tenantId);
        if (stampId != null) {
            DeploymentStamp stamp = stamps.get(stampId);
            if (stamp != null) {
                stamp.processRequest(request);
            }
        }
    }

    public void printTenantDistribution() {
        System.out.println("\nTenant Distribution:");
        Map<String, Long> stampTenantCounts = new HashMap<>();

        tenantToStamp.values().forEach(stampId ->
            stampTenantCounts.put(stampId, stampTenantCounts.getOrDefault(stampId, 0L) + 1)
        );

        stamps.forEach((stampId, stamp) -> {
            long tenantCount = stampTenantCounts.getOrDefault(stampId, 0L);
            System.out.println("  " + stampId + ": " + tenantCount + " tenants, " +
                             stamp.getRequestCount() + " requests");
        });
    }
}

/**
 * Health-monitored stamp cluster
 */
class HealthMonitoredStampCluster {
    private final Map<String, DeploymentStamp> stamps;
    private final ScheduledExecutorService healthCheckExecutor;
    private final Map<String, AtomicInteger> healthCheckCounts;

    public HealthMonitoredStampCluster() {
        this.stamps = new ConcurrentHashMap<>();
        this.healthCheckExecutor = Executors.newScheduledThreadPool(1);
        this.healthCheckCounts = new ConcurrentHashMap<>();
    }

    public void addStamp(String id) {
        DeploymentStamp stamp = new DeploymentStamp(id, Region.US_EAST);
        stamps.put(id, stamp);
        healthCheckCounts.put(id, new AtomicInteger(0));
    }

    public void startHealthChecks(long intervalMs) {
        healthCheckExecutor.scheduleAtFixedRate(() -> {
            stamps.forEach((id, stamp) -> {
                boolean healthy = performHealthCheck(stamp);
                healthCheckCounts.get(id).incrementAndGet();
                if (!healthy) {
                    stamp.setStatus(StampStatus.UNHEALTHY);
                }
            });
        }, 0, intervalMs, TimeUnit.MILLISECONDS);
    }

    private boolean performHealthCheck(DeploymentStamp stamp) {
        // Simplified health check
        return stamp.getStatus() != StampStatus.UNHEALTHY;
    }

    public void simulateHealthChange(String stampId, StampStatus newStatus) {
        DeploymentStamp stamp = stamps.get(stampId);
        if (stamp != null) {
            stamp.setStatus(newStatus);
            System.out.println(stampId + " status changed to " + newStatus);
        }
    }

    public void printHealthReport() {
        System.out.println("\nHealth Report:");
        stamps.forEach((id, stamp) -> {
            int checks = healthCheckCounts.get(id).get();
            System.out.println("  " + id + ": " + stamp.getStatus() +
                             " (" + checks + " health checks)");
        });
    }

    public void stopHealthChecks() {
        healthCheckExecutor.shutdown();
    }
}

/**
 * Blue-green deployment manager
 */
class BlueGreenStampManager {
    private List<DeploymentStamp> blueStamps;
    private List<DeploymentStamp> greenStamps;
    private boolean activeIsBlue;
    private int greenTrafficPercent;

    public BlueGreenStampManager() {
        this.blueStamps = new ArrayList<>();
        this.greenStamps = new ArrayList<>();
        this.activeIsBlue = true;
        this.greenTrafficPercent = 0;
    }

    public void deployBlueEnvironment(String version, int count) {
        blueStamps.clear();
        for (int i = 0; i < count; i++) {
            DeploymentStamp stamp = new DeploymentStamp("Blue-" + i, Region.US_EAST, version);
            blueStamps.add(stamp);
        }
    }

    public void deployGreenEnvironment(String version, int count) {
        greenStamps.clear();
        for (int i = 0; i < count; i++) {
            DeploymentStamp stamp = new DeploymentStamp("Green-" + i, Region.US_EAST, version);
            greenStamps.add(stamp);
        }
    }

    public void routeTrafficPercentage(int greenPercent) {
        this.greenTrafficPercent = greenPercent;
    }

    public void switchToGreen() {
        activeIsBlue = false;
        greenTrafficPercent = 100;
    }

    public void printDeploymentStatus() {
        System.out.println("\nBlue-Green Deployment Status:");
        System.out.println("  Active environment: " + (activeIsBlue ? "Blue" : "Green"));
        System.out.println("  Blue traffic: " + (100 - greenTrafficPercent) + "%");
        System.out.println("  Green traffic: " + greenTrafficPercent + "%");
        System.out.println("  Blue stamps: " + blueStamps.size() +
                         " (version " + (blueStamps.isEmpty() ? "N/A" : blueStamps.get(0).getVersion()) + ")");
        System.out.println("  Green stamps: " + greenStamps.size() +
                         " (version " + (greenStamps.isEmpty() ? "N/A" : greenStamps.get(0).getVersion()) + ")");
    }
}

/**
 * Affinity-based stamp router for session persistence
 */
class AffinityBasedStampRouter {
    private final List<DeploymentStamp> stamps;
    private final Map<String, String> sessionToStamp;
    private final Map<String, AtomicInteger> stampAffinityCount;

    public AffinityBasedStampRouter(int stampCount) {
        this.stamps = new ArrayList<>();
        this.sessionToStamp = new ConcurrentHashMap<>();
        this.stampAffinityCount = new ConcurrentHashMap<>();

        for (int i = 0; i < stampCount; i++) {
            String stampId = "Affinity-Stamp-" + i;
            stamps.add(new DeploymentStamp(stampId, Region.US_EAST));
            stampAffinityCount.put(stampId, new AtomicInteger(0));
        }
    }

    public CompletableFuture<String> routeWithAffinity(String sessionId, Request request) {
        String stampId = sessionToStamp.computeIfAbsent(sessionId, sid -> {
            // Assign session to stamp based on hash
            int index = Math.abs(sessionId.hashCode() % stamps.size());
            DeploymentStamp stamp = stamps.get(index);
            System.out.println("Session " + sessionId + " assigned to " + stamp.getId());
            return stamp.getId();
        });

        // Find the stamp and process request
        DeploymentStamp targetStamp = stamps.stream()
            .filter(stamp -> stamp.getId().equals(stampId))
            .findFirst()
            .orElseThrow();

        stampAffinityCount.get(stampId).incrementAndGet();
        return targetStamp.processRequestAsync(request);
    }

    public void printAffinityStats() {
        System.out.println("\nSession Affinity Statistics:");
        System.out.println("  Total sessions: " + sessionToStamp.size());
        stampAffinityCount.forEach((stampId, count) ->
            System.out.println("  " + stampId + ": " + count.get() + " affinity requests")
        );
    }
}
