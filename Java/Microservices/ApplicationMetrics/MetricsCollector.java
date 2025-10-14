package Microservices.ApplicationMetrics;
import java.util.*;
public class MetricsCollector {
    private int totalRequests = 0;
    private int totalErrors = 0;
    private List<Long> responseTimes = new ArrayList<>();
    private Map<String, Integer> endpointCounts = new HashMap<>();
    
    public void recordRequest(String endpoint, long responseTime) {
        totalRequests++;
        responseTimes.add(responseTime);
        endpointCounts.put(endpoint, endpointCounts.getOrDefault(endpoint, 0) + 1);
    }
    
    public void recordError(String endpoint) {
        totalErrors++;
        System.out.println("Error recorded for: " + endpoint);
    }
    
    public void showMetrics() {
        System.out.println("\n=== Metrics Summary ===");
        System.out.println("Total Requests: " + totalRequests);
        System.out.println("Total Errors: " + totalErrors);
        System.out.println("Avg Response Time: " + getAverageResponseTime() + "ms");
        System.out.println("Error Rate: " + String.format("%.2f%%", (totalErrors * 100.0 / totalRequests)));
        System.out.println("\nEndpoint Breakdown:");
        endpointCounts.forEach((k, v) -> System.out.println("  " + k + ": " + v + " requests"));
    }
    
    private double getAverageResponseTime() {
        return responseTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
    }
}
