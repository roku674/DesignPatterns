package Cloud.HealthEndpointMonitoring;

import java.util.*;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;

/**
 * Health Endpoint Monitoring Pattern Demonstration
 *
 * <p>The Health Endpoint Monitoring pattern implements health checks in an application to verify
 * that services and components are functioning correctly. External monitoring tools can access
 * these endpoints to check the health status.</p>
 *
 * <p>Key Benefits:</p>
 * <ul>
 *   <li>Early detection of application failures</li>
 *   <li>Proactive monitoring and alerting</li>
 *   <li>Load balancer integration for routing</li>
 *   <li>Detailed component-level health status</li>
 * </ul>
 *
 * @author Design Patterns Demo
 * @version 1.0
 */
public class Main {

    /**
     * Health status enumeration.
     */
    enum HealthStatus {
        HEALTHY,
        DEGRADED,
        UNHEALTHY
    }

    /**
     * Health check result.
     */
    static class HealthCheckResult {
        private String componentName;
        private HealthStatus status;
        private String message;
        private long responseTimeMs;
        private LocalDateTime timestamp;
        private Map<String, Object> details;

        public HealthCheckResult(String componentName, HealthStatus status, String message, long responseTimeMs) {
            this.componentName = componentName;
            this.status = status;
            this.message = message;
            this.responseTimeMs = responseTimeMs;
            this.timestamp = LocalDateTime.now();
            this.details = new HashMap<>();
        }

        public String getComponentName() { return componentName; }
        public HealthStatus getStatus() { return status; }
        public String getMessage() { return message; }
        public long getResponseTimeMs() { return responseTimeMs; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public Map<String, Object> getDetails() { return details; }

        public void addDetail(String key, Object value) {
            details.put(key, value);
        }

        @Override
        public String toString() {
            return String.format("[%s] %s: %s (% dms)", componentName, status, message, responseTimeMs);
        }
    }

    /**
     * Health check interface.
     */
    interface HealthCheck {
        HealthCheckResult check();
        String getName();
    }

    /**
     * Database health check.
     */
    static class DatabaseHealthCheck implements HealthCheck {
        private String databaseName;
        private boolean isConnected;
        private int connectionPoolSize;

        public DatabaseHealthCheck(String databaseName) {
            this.databaseName = databaseName;
            this.isConnected = true;
            this.connectionPoolSize = 10;
        }

        @Override
        public HealthCheckResult check() {
            long startTime = System.currentTimeMillis();

            try {
                Thread.sleep(50);

                if (!isConnected) {
                    long duration = System.currentTimeMillis() - startTime;
                    HealthCheckResult result = new HealthCheckResult(
                        getName(), HealthStatus.UNHEALTHY, "Database connection lost", duration);
                    result.addDetail("database", databaseName);
                    return result;
                }

                if (connectionPoolSize < 3) {
                    long duration = System.currentTimeMillis() - startTime;
                    HealthCheckResult result = new HealthCheckResult(
                        getName(), HealthStatus.DEGRADED, "Low connection pool", duration);
                    result.addDetail("database", databaseName);
                    result.addDetail("availableConnections", connectionPoolSize);
                    return result;
                }

                long duration = System.currentTimeMillis() - startTime;
                HealthCheckResult result = new HealthCheckResult(
                    getName(), HealthStatus.HEALTHY, "Database operational", duration);
                result.addDetail("database", databaseName);
                result.addDetail("availableConnections", connectionPoolSize);
                return result;

            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                return new HealthCheckResult(getName(), HealthStatus.UNHEALTHY,
                    "Health check failed: " + e.getMessage(), duration);
            }
        }

        @Override
        public String getName() {
            return "Database";
        }

        public void setConnected(boolean connected) {
            this.isConnected = connected;
        }

        public void setConnectionPoolSize(int size) {
            this.connectionPoolSize = size;
        }
    }

    /**
     * External API health check.
     */
    static class ExternalApiHealthCheck implements HealthCheck {
        private String apiName;
        private String endpoint;
        private boolean isReachable;

        public ExternalApiHealthCheck(String apiName, String endpoint) {
            this.apiName = apiName;
            this.endpoint = endpoint;
            this.isReachable = true;
        }

        @Override
        public HealthCheckResult check() {
            long startTime = System.currentTimeMillis();

            try {
                Thread.sleep(30);

                if (!isReachable) {
                    long duration = System.currentTimeMillis() - startTime;
                    HealthCheckResult result = new HealthCheckResult(
                        getName(), HealthStatus.UNHEALTHY, "API unreachable", duration);
                    result.addDetail("api", apiName);
                    result.addDetail("endpoint", endpoint);
                    return result;
                }

                long duration = System.currentTimeMillis() - startTime;
                HealthCheckResult result = new HealthCheckResult(
                    getName(), HealthStatus.HEALTHY, "API responsive", duration);
                result.addDetail("api", apiName);
                result.addDetail("endpoint", endpoint);
                return result;

            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                return new HealthCheckResult(getName(), HealthStatus.UNHEALTHY,
                    "Health check failed: " + e.getMessage(), duration);
            }
        }

        @Override
        public String getName() {
            return "ExternalAPI";
        }

        public void setReachable(boolean reachable) {
            this.isReachable = reachable;
        }
    }

    /**
     * Memory health check.
     */
    static class MemoryHealthCheck implements HealthCheck {
        private double warningThreshold;
        private double criticalThreshold;

        public MemoryHealthCheck(double warningThreshold, double criticalThreshold) {
            this.warningThreshold = warningThreshold;
            this.criticalThreshold = criticalThreshold;
        }

        @Override
        public HealthCheckResult check() {
            long startTime = System.currentTimeMillis();

            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            double usagePercent = (double) usedMemory / totalMemory * 100;

            long duration = System.currentTimeMillis() - startTime;

            HealthCheckResult result;
            if (usagePercent >= criticalThreshold) {
                result = new HealthCheckResult(getName(), HealthStatus.UNHEALTHY,
                    "Memory usage critical", duration);
            } else if (usagePercent >= warningThreshold) {
                result = new HealthCheckResult(getName(), HealthStatus.DEGRADED,
                    "Memory usage high", duration);
            } else {
                result = new HealthCheckResult(getName(), HealthStatus.HEALTHY,
                    "Memory usage normal", duration);
            }

            result.addDetail("usedMemoryMB", usedMemory / 1024 / 1024);
            result.addDetail("totalMemoryMB", totalMemory / 1024 / 1024);
            result.addDetail("usagePercent", String.format("%.2f%%", usagePercent));

            return result;
        }

        @Override
        public String getName() {
            return "Memory";
        }
    }

    /**
     * Disk space health check.
     */
    static class DiskSpaceHealthCheck implements HealthCheck {
        private long warningThresholdMB;
        private long criticalThresholdMB;
        private long availableSpaceMB;

        public DiskSpaceHealthCheck(long warningThresholdMB, long criticalThresholdMB) {
            this.warningThresholdMB = warningThresholdMB;
            this.criticalThresholdMB = criticalThresholdMB;
            this.availableSpaceMB = 5000;
        }

        @Override
        public HealthCheckResult check() {
            long startTime = System.currentTimeMillis();
            long duration = System.currentTimeMillis() - startTime;

            HealthCheckResult result;
            if (availableSpaceMB <= criticalThresholdMB) {
                result = new HealthCheckResult(getName(), HealthStatus.UNHEALTHY,
                    "Disk space critical", duration);
            } else if (availableSpaceMB <= warningThresholdMB) {
                result = new HealthCheckResult(getName(), HealthStatus.DEGRADED,
                    "Disk space low", duration);
            } else {
                result = new HealthCheckResult(getName(), HealthStatus.HEALTHY,
                    "Disk space sufficient", duration);
            }

            result.addDetail("availableSpaceMB", availableSpaceMB);
            result.addDetail("warningThresholdMB", warningThresholdMB);
            result.addDetail("criticalThresholdMB", criticalThresholdMB);

            return result;
        }

        @Override
        public String getName() {
            return "DiskSpace";
        }

        public void setAvailableSpaceMB(long space) {
            this.availableSpaceMB = space;
        }
    }

    /**
     * Health monitor that aggregates all health checks.
     */
    static class HealthMonitor {
        private List<HealthCheck> healthChecks;
        private Map<String, HealthCheckResult> lastResults;

        public HealthMonitor() {
            this.healthChecks = new ArrayList<>();
            this.lastResults = new ConcurrentHashMap<>();
        }

        public void registerHealthCheck(HealthCheck check) {
            healthChecks.add(check);
        }

        public Map<String, HealthCheckResult> performHealthChecks() {
            Map<String, HealthCheckResult> results = new HashMap<>();

            for (HealthCheck check : healthChecks) {
                HealthCheckResult result = check.check();
                results.put(check.getName(), result);
                lastResults.put(check.getName(), result);
            }

            return results;
        }

        public HealthStatus getOverallStatus() {
            if (lastResults.isEmpty()) {
                return HealthStatus.UNHEALTHY;
            }

            boolean hasUnhealthy = false;
            boolean hasDegraded = false;

            for (HealthCheckResult result : lastResults.values()) {
                if (result.getStatus() == HealthStatus.UNHEALTHY) {
                    hasUnhealthy = true;
                } else if (result.getStatus() == HealthStatus.DEGRADED) {
                    hasDegraded = true;
                }
            }

            if (hasUnhealthy) {
                return HealthStatus.UNHEALTHY;
            } else if (hasDegraded) {
                return HealthStatus.DEGRADED;
            } else {
                return HealthStatus.HEALTHY;
            }
        }

        public Map<String, HealthCheckResult> getLastResults() {
            return new HashMap<>(lastResults);
        }
    }

    /**
     * Health endpoint handler.
     */
    static class HealthEndpoint {
        private HealthMonitor monitor;

        public HealthEndpoint(HealthMonitor monitor) {
            this.monitor = monitor;
        }

        public String getHealthStatus() {
            Map<String, HealthCheckResult> results = monitor.performHealthChecks();
            HealthStatus overall = monitor.getOverallStatus();

            StringBuilder response = new StringBuilder();
            response.append("{\n");
            response.append("  \"status\": \"").append(overall).append("\",\n");
            response.append("  \"timestamp\": \"").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\",\n");
            response.append("  \"checks\": {\n");

            int count = 0;
            for (Map.Entry<String, HealthCheckResult> entry : results.entrySet()) {
                HealthCheckResult result = entry.getValue();
                response.append("    \"").append(entry.getKey()).append("\": {\n");
                response.append("      \"status\": \"").append(result.getStatus()).append("\",\n");
                response.append("      \"message\": \"").append(result.getMessage()).append("\",\n");
                response.append("      \"responseTime\": ").append(result.getResponseTimeMs()).append(",\n");
                response.append("      \"details\": ").append(result.getDetails()).append("\n");
                response.append("    }");
                if (++count < results.size()) {
                    response.append(",");
                }
                response.append("\n");
            }

            response.append("  }\n");
            response.append("}");

            return response.toString();
        }

        public int getHttpStatusCode() {
            HealthStatus status = monitor.getOverallStatus();
            switch (status) {
                case HEALTHY:
                    return 200;
                case DEGRADED:
                    return 200;
                case UNHEALTHY:
                    return 503;
                default:
                    return 500;
            }
        }
    }

    private static void printSection(String title) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println(title);
        System.out.println("=".repeat(60));
    }

    /**
     * Main method demonstrating the Health Endpoint Monitoring pattern with 10 scenarios.
     *
     * @param args Command line arguments
     */
    public static void main(String[] args) {
        System.out.println("=== Health Endpoint Monitoring Pattern Demonstration ===\n");
        System.out.println("This pattern implements health checks in an application.");
        System.out.println("Timestamp: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Setup health monitor
        HealthMonitor monitor = new HealthMonitor();

        DatabaseHealthCheck dbCheck = new DatabaseHealthCheck("ProductionDB");
        ExternalApiHealthCheck apiCheck = new ExternalApiHealthCheck("PaymentAPI", "https://api.payment.com/health");
        MemoryHealthCheck memoryCheck = new MemoryHealthCheck(70.0, 90.0);
        DiskSpaceHealthCheck diskCheck = new DiskSpaceHealthCheck(1000, 500);

        monitor.registerHealthCheck(dbCheck);
        monitor.registerHealthCheck(apiCheck);
        monitor.registerHealthCheck(memoryCheck);
        monitor.registerHealthCheck(diskCheck);

        HealthEndpoint endpoint = new HealthEndpoint(monitor);

        // Scenario 1: All systems healthy
        printSection("Scenario 1: All Systems Healthy");
        String health1 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health1);

        // Scenario 2: Database degraded (low connections)
        printSection("Scenario 2: Database Degraded State");
        dbCheck.setConnectionPoolSize(2);
        String health2 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health2);

        // Scenario 3: External API unreachable
        printSection("Scenario 3: External API Failure");
        apiCheck.setReachable(false);
        String health3 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health3);

        // Scenario 4: Recovery - API back online
        printSection("Scenario 4: System Recovery");
        apiCheck.setReachable(true);
        dbCheck.setConnectionPoolSize(10);
        String health4 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health4);

        // Scenario 5: Low disk space
        printSection("Scenario 5: Low Disk Space Warning");
        diskCheck.setAvailableSpaceMB(800);
        String health5 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health5);

        // Scenario 6: Critical disk space
        printSection("Scenario 6: Critical Disk Space");
        diskCheck.setAvailableSpaceMB(400);
        String health6 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health6);

        // Scenario 7: Multiple failures
        printSection("Scenario 7: Multiple System Failures");
        dbCheck.setConnected(false);
        apiCheck.setReachable(false);
        String health7 = endpoint.getHealthStatus();
        System.out.println("HTTP Status: " + endpoint.getHttpStatusCode());
        System.out.println(health7);

        // Scenario 8: Individual component checks
        printSection("Scenario 8: Individual Component Status");
        dbCheck.setConnected(true);
        apiCheck.setReachable(true);
        diskCheck.setAvailableSpaceMB(5000);
        Map<String, HealthCheckResult> results = monitor.performHealthChecks();
        for (Map.Entry<String, HealthCheckResult> entry : results.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // Scenario 9: Response time monitoring
        printSection("Scenario 9: Response Time Analysis");
        System.out.println("Health check response times:");
        Map<String, HealthCheckResult> timingResults = monitor.performHealthChecks();
        long totalTime = 0;
        for (HealthCheckResult result : timingResults.values()) {
            System.out.println("  " + result.getComponentName() + ": " + result.getResponseTimeMs() + "ms");
            totalTime += result.getResponseTimeMs();
        }
        System.out.println("Total health check time: " + totalTime + "ms");

        // Scenario 10: Summary and best practices
        printSection("Scenario 10: Pattern Summary and Best Practices");
        System.out.println("Health Endpoint Monitoring Features:");
        System.out.println("1. Component-level health checks - Database, APIs, resources");
        System.out.println("2. Aggregated health status - Overall system health");
        System.out.println("3. Detailed diagnostics - Response times and error details");
        System.out.println("4. HTTP status codes - 200 (healthy), 503 (unhealthy)");
        System.out.println("5. Degraded state detection - Early warning system");
        System.out.println("\nBenefits:");
        System.out.println("- Early failure detection and alerting");
        System.out.println("- Load balancer integration for traffic routing");
        System.out.println("- Operational visibility into system health");
        System.out.println("- Automated recovery and remediation triggers");
        System.out.println("- Improved uptime and reliability");
        System.out.println("\nBest Practices:");
        System.out.println("- Implement deep health checks beyond simple ping");
        System.out.println("- Use timeouts to prevent hanging health checks");
        System.out.println("- Cache health check results to reduce overhead");
        System.out.println("- Provide detailed diagnostic information");
        System.out.println("- Monitor health check endpoint performance");
        System.out.println("- Integrate with monitoring and alerting systems");

        System.out.println("\n=== Pattern Demonstration Complete ===");
    }
}
