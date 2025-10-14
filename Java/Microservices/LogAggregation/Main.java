package Microservices.LogAggregation;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.*;

/**
 * Log Aggregation Pattern Implementation
 *
 * <p>Log Aggregation centralizes logs from multiple microservices into a single location
 * for unified searching, monitoring, and analysis. This pattern enables correlation of
 * events across services and provides visibility into distributed system behavior.</p>
 *
 * <h2>Pattern Benefits:</h2>
 * <ul>
 *   <li>Centralized log management and searching</li>
 *   <li>Cross-service correlation and debugging</li>
 *   <li>Real-time monitoring and alerting</li>
 *   <li>Historical analysis and audit trails</li>
 *   <li>Performance and error pattern detection</li>
 * </ul>
 *
 * <h2>Implementation Scenarios:</h2>
 * <ol>
 *   <li>Basic Log Collection</li>
 *   <li>Multi-Service Log Aggregation</li>
 *   <li>Log Level Filtering</li>
 *   <li>Time-Range Queries</li>
 *   <li>Pattern Matching and Search</li>
 *   <li>Error Rate Analysis</li>
 *   <li>Service Health Monitoring</li>
 *   <li>Log Retention and Archival</li>
 *   <li>Real-time Log Streaming</li>
 *   <li>Full Monitoring Dashboard</li>
 * </ol>
 *
 * @author Design Patterns Implementation
 * @version 2.0
 * @since 2024-01-01
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║          LOG AGGREGATION PATTERN - MICROSERVICES              ║");
        System.out.println("║        Centralized Logging & Monitoring Solution              ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");

        demonstrateBasicCollection();
        demonstrateMultiServiceAggregation();
        demonstrateLevelFiltering();
        demonstrateTimeRangeQueries();
        demonstratePatternMatching();
        demonstrateErrorRateAnalysis();
        demonstrateHealthMonitoring();
        demonstrateRetentionPolicies();
        demonstrateRealTimeStreaming();
        demonstrateMonitoringDashboard();

        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           ALL SCENARIOS COMPLETED SUCCESSFULLY                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
    }

    private static void demonstrateBasicCollection() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 1: Basic Log Collection");
        System.out.println("=".repeat(70));

        LogAggregator aggregator = new LogAggregator();

        System.out.println("\n→ Collecting logs from services");
        aggregator.receiveLog("OrderService", "INFO", "Order created: ORD-001");
        aggregator.receiveLog("PaymentService", "INFO", "Payment processed: $99.99");
        aggregator.receiveLog("ShippingService", "INFO", "Shipment created: SHIP-001");

        System.out.println("\n→ Viewing aggregated logs");
        aggregator.search("OrderService");

        System.out.println("\n✓ Scenario 1 completed");
    }

    private static void demonstrateMultiServiceAggregation() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 2: Multi-Service Log Aggregation");
        System.out.println("=".repeat(70));

        MultiServiceAggregator aggregator = new MultiServiceAggregator();

        System.out.println("\n→ Collecting logs from multiple services");
        aggregator.collectLogs("API-Gateway", 5);
        aggregator.collectLogs("Auth-Service", 3);
        aggregator.collectLogs("User-Service", 4);
        aggregator.collectLogs("Database", 2);

        System.out.println("\n→ Aggregation statistics");
        aggregator.printStatistics();

        System.out.println("\n✓ Scenario 2 completed");
    }

    private static void demonstrateLevelFiltering() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 3: Log Level Filtering");
        System.out.println("=".repeat(70));

        LevelFilteringAggregator aggregator = new LevelFilteringAggregator();

        System.out.println("\n→ Generating logs with different levels");
        aggregator.log("Service-A", "DEBUG", "Detailed debug information");
        aggregator.log("Service-A", "INFO", "Processing request");
        aggregator.log("Service-B", "WARN", "High memory usage detected");
        aggregator.log("Service-C", "ERROR", "Database connection failed");
        aggregator.log("Service-D", "FATAL", "Critical system failure");

        System.out.println("\n→ Filtering by level");
        aggregator.filterByLevel("ERROR");
        aggregator.filterByLevel("WARN");

        System.out.println("\n✓ Scenario 3 completed");
    }

    private static void demonstrateTimeRangeQueries() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 4: Time-Range Queries");
        System.out.println("=".repeat(70));

        TimeRangeAggregator aggregator = new TimeRangeAggregator();

        System.out.println("\n→ Generating logs over time");
        LocalDateTime now = LocalDateTime.now();
        aggregator.log("Service-X", "INFO", "Event 1", now.minusHours(2));
        aggregator.log("Service-X", "INFO", "Event 2", now.minusHours(1));
        aggregator.log("Service-X", "INFO", "Event 3", now.minusMinutes(30));
        aggregator.log("Service-X", "INFO", "Event 4", now);

        System.out.println("\n→ Querying last hour");
        aggregator.queryTimeRange(now.minusHours(1), now);

        System.out.println("\n✓ Scenario 4 completed");
    }

    private static void demonstratePatternMatching() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 5: Pattern Matching and Search");
        System.out.println("=".repeat(70));

        PatternMatchingAggregator aggregator = new PatternMatchingAggregator();

        System.out.println("\n→ Indexing logs");
        aggregator.index("Order-Service", "INFO", "Order ORD-123 created successfully");
        aggregator.index("Order-Service", "ERROR", "Order ORD-456 failed validation");
        aggregator.index("Payment-Service", "INFO", "Payment for order ORD-123 processed");
        aggregator.index("Payment-Service", "ERROR", "Payment declined for ORD-789");

        System.out.println("\n→ Searching patterns");
        aggregator.search("ORD-123");
        aggregator.search("failed|declined");

        System.out.println("\n✓ Scenario 5 completed");
    }

    private static void demonstrateErrorRateAnalysis() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 6: Error Rate Analysis");
        System.out.println("=".repeat(70));

        ErrorRateAnalyzer analyzer = new ErrorRateAnalyzer();

        System.out.println("\n→ Simulating service operations");
        for (int i = 0; i < 100; i++) {
            String service = "Service-" + (char)('A' + (i % 3));
            boolean hasError = Math.random() < 0.15; // 15% error rate
            analyzer.recordOperation(service, hasError);
        }

        System.out.println("\n→ Analyzing error rates");
        analyzer.analyzeErrorRates();

        System.out.println("\n✓ Scenario 6 completed");
    }

    private static void demonstrateHealthMonitoring() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 7: Service Health Monitoring");
        System.out.println("=".repeat(70));

        HealthMonitor monitor = new HealthMonitor();

        System.out.println("\n→ Monitoring service health");
        monitor.recordHeartbeat("API-Gateway", true);
        monitor.recordHeartbeat("Auth-Service", true);
        monitor.recordHeartbeat("Database", false);
        monitor.recordHeartbeat("Cache", true);
        monitor.recordHeartbeat("Database", false);

        System.out.println("\n→ Health status report");
        monitor.generateHealthReport();

        System.out.println("\n✓ Scenario 7 completed");
    }

    private static void demonstrateRetentionPolicies() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 8: Log Retention and Archival");
        System.out.println("=".repeat(70));

        RetentionManager manager = new RetentionManager(7); // 7 days retention

        System.out.println("\n→ Adding logs with different ages");
        manager.addLog("Service-A", LocalDateTime.now().minusDays(1));
        manager.addLog("Service-A", LocalDateTime.now().minusDays(5));
        manager.addLog("Service-A", LocalDateTime.now().minusDays(10));
        manager.addLog("Service-A", LocalDateTime.now().minusDays(15));

        System.out.println("\n→ Applying retention policy");
        manager.applyRetentionPolicy();

        System.out.println("\n→ Archiving old logs");
        manager.archiveExpired();

        System.out.println("\n✓ Scenario 8 completed");
    }

    private static void demonstrateRealTimeStreaming() throws InterruptedException {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 9: Real-time Log Streaming");
        System.out.println("=".repeat(70));

        RealTimeLogStream stream = new RealTimeLogStream();

        System.out.println("\n→ Starting log stream");
        stream.start();

        System.out.println("\n→ Streaming logs in real-time");
        for (int i = 1; i <= 5; i++) {
            stream.emit("Service-" + i, "INFO", "Real-time event " + i);
            Thread.sleep(100);
        }

        System.out.println("\n→ Stream statistics");
        stream.printStatistics();

        System.out.println("\n✓ Scenario 9 completed");
    }

    private static void demonstrateMonitoringDashboard() {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("SCENARIO 10: Full Monitoring Dashboard");
        System.out.println("=".repeat(70));

        MonitoringDashboard dashboard = new MonitoringDashboard();

        System.out.println("\n→ Simulating production workload");
        dashboard.simulateWorkload(50);

        System.out.println("\n→ Generating dashboard");
        dashboard.render();

        System.out.println("\n✓ Scenario 10 completed");
    }
}

class MultiServiceAggregator {
    private Map<String, Integer> logCounts = new HashMap<>();

    public void collectLogs(String service, int count) {
        logCounts.merge(service, count, Integer::sum);
        System.out.println("  [COLLECT] " + service + ": " + count + " logs");
    }

    public void printStatistics() {
        int total = logCounts.values().stream().mapToInt(Integer::intValue).sum();
        System.out.println("  Total logs collected: " + total);
        System.out.println("  Services reporting: " + logCounts.size());
        System.out.println("  By service:");
        logCounts.forEach((service, count) ->
            System.out.println("    " + service + ": " + count + " (" + (count * 100 / total) + "%)"));
    }
}

class LevelFilteringAggregator {
    private List<LogEntry> logs = new ArrayList<>();

    public void log(String service, String level, String message) {
        logs.add(new LogEntry(service, level, message, LocalDateTime.now()));
        System.out.println("  [" + level + "] " + service + ": " + message);
    }

    public void filterByLevel(String level) {
        List<LogEntry> filtered = logs.stream()
            .filter(log -> log.level.equals(level))
            .collect(Collectors.toList());
        System.out.println("  [FILTER] " + level + " logs: " + filtered.size() + " found");
        filtered.forEach(log -> System.out.println("    • " + log.service + ": " + log.message));
    }
}

class TimeRangeAggregator {
    private List<TimedLogEntry> logs = new ArrayList<>();

    public void log(String service, String level, String message, LocalDateTime timestamp) {
        logs.add(new TimedLogEntry(service, level, message, timestamp));
    }

    public void queryTimeRange(LocalDateTime start, LocalDateTime end) {
        List<TimedLogEntry> filtered = logs.stream()
            .filter(log -> !log.timestamp.isBefore(start) && !log.timestamp.isAfter(end))
            .collect(Collectors.toList());

        System.out.println("  Found " + filtered.size() + " logs in range");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        filtered.forEach(log ->
            System.out.println("    [" + log.timestamp.format(formatter) + "] " + log.message));
    }

    static class TimedLogEntry extends LogEntry {
        TimedLogEntry(String service, String level, String message, LocalDateTime timestamp) {
            super(service, level, message, timestamp);
        }
    }
}

class PatternMatchingAggregator {
    private List<LogEntry> logs = new ArrayList<>();

    public void index(String service, String level, String message) {
        logs.add(new LogEntry(service, level, message, LocalDateTime.now()));
        System.out.println("  [INDEX] " + service + ": " + message);
    }

    public void search(String pattern) {
        List<LogEntry> matches = logs.stream()
            .filter(log -> log.message.matches(".*" + pattern + ".*"))
            .collect(Collectors.toList());

        System.out.println("  [SEARCH] Pattern '" + pattern + "': " + matches.size() + " matches");
        matches.forEach(log -> System.out.println("    → " + log.service + ": " + log.message));
    }
}

class ErrorRateAnalyzer {
    private Map<String, ServiceStats> stats = new HashMap<>();

    public void recordOperation(String service, boolean hasError) {
        stats.computeIfAbsent(service, k -> new ServiceStats()).record(hasError);
    }

    public void analyzeErrorRates() {
        System.out.println("  Service Error Rates:");
        stats.forEach((service, stat) -> {
            double errorRate = (stat.errors * 100.0) / stat.total;
            String status = errorRate > 10 ? "CRITICAL" : errorRate > 5 ? "WARNING" : "HEALTHY";
            System.out.println("    " + service + ": " + String.format("%.2f", errorRate) + "% [" + status + "]");
            System.out.println("      Total: " + stat.total + ", Errors: " + stat.errors);
        });
    }

    static class ServiceStats {
        int total = 0;
        int errors = 0;

        void record(boolean hasError) {
            total++;
            if (hasError) errors++;
        }
    }
}

class HealthMonitor {
    private Map<String, ServiceHealth> healthStatus = new HashMap<>();

    public void recordHeartbeat(String service, boolean healthy) {
        ServiceHealth health = healthStatus.computeIfAbsent(service, k -> new ServiceHealth());
        health.recordHeartbeat(healthy);
        String status = healthy ? "UP" : "DOWN";
        System.out.println("  [HEARTBEAT] " + service + ": " + status);
    }

    public void generateHealthReport() {
        System.out.println("  Overall Health Status:");
        healthStatus.forEach((service, health) -> {
            String status = health.isHealthy() ? "HEALTHY" : "DEGRADED";
            System.out.println("    " + service + ": " + status);
            System.out.println("      Uptime: " + health.getUptimePercentage() + "%");
            System.out.println("      Total checks: " + health.totalChecks);
        });
    }

    static class ServiceHealth {
        int totalChecks = 0;
        int healthyChecks = 0;

        void recordHeartbeat(boolean healthy) {
            totalChecks++;
            if (healthy) healthyChecks++;
        }

        boolean isHealthy() {
            return getUptimePercentage() > 80;
        }

        int getUptimePercentage() {
            return totalChecks > 0 ? (healthyChecks * 100 / totalChecks) : 0;
        }
    }
}

class RetentionManager {
    private int retentionDays;
    private List<ArchivedLog> logs = new ArrayList<>();
    private List<ArchivedLog> archived = new ArrayList<>();

    public RetentionManager(int retentionDays) {
        this.retentionDays = retentionDays;
    }

    public void addLog(String service, LocalDateTime timestamp) {
        logs.add(new ArchivedLog(service, timestamp));
        System.out.println("  [LOG] Added: " + service + " from " + timestamp.toLocalDate());
    }

    public void applyRetentionPolicy() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        long expired = logs.stream().filter(log -> log.timestamp.isBefore(cutoff)).count();

        System.out.println("  [RETENTION] Policy: " + retentionDays + " days");
        System.out.println("    Total logs: " + logs.size());
        System.out.println("    Expired: " + expired);
        System.out.println("    Retained: " + (logs.size() - expired));
    }

    public void archiveExpired() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        List<ArchivedLog> toArchive = logs.stream()
            .filter(log -> log.timestamp.isBefore(cutoff))
            .collect(Collectors.toList());

        archived.addAll(toArchive);
        logs.removeAll(toArchive);

        System.out.println("  [ARCHIVE] Archived " + toArchive.size() + " logs");
        System.out.println("    Active logs: " + logs.size());
        System.out.println("    Archived logs: " + archived.size());
    }

    static class ArchivedLog {
        String service;
        LocalDateTime timestamp;

        ArchivedLog(String service, LocalDateTime timestamp) {
            this.service = service;
            this.timestamp = timestamp;
        }
    }
}

class RealTimeLogStream {
    private int eventsStreamed = 0;
    private LocalDateTime streamStart;

    public void start() {
        streamStart = LocalDateTime.now();
        System.out.println("  [STREAM] Started at " + streamStart.toLocalTime());
    }

    public void emit(String service, String level, String message) {
        eventsStreamed++;
        System.out.println("  [STREAM] " + service + " | " + level + " | " + message);
    }

    public void printStatistics() {
        Duration elapsed = Duration.between(streamStart, LocalDateTime.now());
        System.out.println("  Stream duration: " + elapsed.toMillis() + "ms");
        System.out.println("  Events streamed: " + eventsStreamed);
        System.out.println("  Events/second: " + (eventsStreamed * 1000 / Math.max(elapsed.toMillis(), 1)));
    }
}

class MonitoringDashboard {
    private LogAggregator aggregator = new LogAggregator();
    private ErrorRateAnalyzer errorAnalyzer = new ErrorRateAnalyzer();
    private HealthMonitor healthMonitor = new HealthMonitor();
    private int totalEvents = 0;

    public void simulateWorkload(int events) {
        System.out.println("  Simulating " + events + " events...");

        String[] services = {"API-Gateway", "Auth", "Orders", "Payments", "Shipping"};
        String[] levels = {"INFO", "WARN", "ERROR"};

        for (int i = 0; i < events; i++) {
            String service = services[i % services.length];
            String level = levels[(int)(Math.random() * levels.length)];
            boolean hasError = level.equals("ERROR");

            aggregator.receiveLog(service, level, "Event " + i);
            errorAnalyzer.recordOperation(service, hasError);
            healthMonitor.recordHeartbeat(service, !hasError);
            totalEvents++;
        }
    }

    public void render() {
        System.out.println("\n  ╔══════════════════════════════════════════════════╗");
        System.out.println("  ║          MONITORING DASHBOARD                    ║");
        System.out.println("  ╚══════════════════════════════════════════════════╝");

        System.out.println("\n  [1] EVENT SUMMARY");
        System.out.println("      Total events: " + totalEvents);

        System.out.println("\n  [2] ERROR ANALYSIS");
        errorAnalyzer.analyzeErrorRates();

        System.out.println("\n  [3] SERVICE HEALTH");
        healthMonitor.generateHealthReport();

        System.out.println("\n  [4] QUICK STATS");
        System.out.println("      Services monitored: 5");
        System.out.println("      Dashboard refresh: Real-time");
        System.out.println("      Status: OPERATIONAL");
    }
}
