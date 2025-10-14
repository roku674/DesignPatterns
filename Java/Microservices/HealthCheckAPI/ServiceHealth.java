package Microservices.HealthCheckAPI;
import java.util.*;
public class ServiceHealth {
    private String serviceName;
    private List<HealthCheck> checks = new ArrayList<>();
    
    public ServiceHealth(String serviceName) {
        this.serviceName = serviceName;
    }
    
    public void addCheck(HealthCheck check) {
        checks.add(check);
    }
    
    public HealthStatus checkHealth() {
        boolean allHealthy = true;
        Map<String, String> checkResults = new HashMap<>();
        
        for (HealthCheck check : checks) {
            boolean healthy = check.isHealthy();
            checkResults.put(check.getName(), healthy ? "UP" : "DOWN");
            if (!healthy) {
                allHealthy = false;
            }
            System.out.println("  " + check.getName() + ": " + (healthy ? "UP" : "DOWN"));
        }
        
        return new HealthStatus(serviceName, allHealthy ? "UP" : "DOWN", checkResults);
    }
}
class HealthStatus {
    String serviceName, overallStatus;
    Map<String, String> checks;
    HealthStatus(String serviceName, String overallStatus, Map<String, String> checks) {
        this.serviceName = serviceName;
        this.overallStatus = overallStatus;
        this.checks = checks;
    }
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Service: ").append(serviceName).append("\n");
        sb.append("Status: ").append(overallStatus).append("\n");
        sb.append("Checks:\n");
        checks.forEach((k, v) -> sb.append("  ").append(k).append(": ").append(v).append("\n"));
        return sb.toString();
    }
}
