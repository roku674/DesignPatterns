package Microservices.LogDeploymentsAndChanges;
import java.time.*;
import java.util.*;
public class DeploymentLogger {
    private List<ChangeRecord> history = new ArrayList<>();
    
    public void logDeployment(String service, String version, String environment, String deployedBy) {
        ChangeRecord record = new ChangeRecord(
            "DEPLOYMENT",
            service,
            "Deployed " + version + " to " + environment,
            deployedBy,
            LocalDateTime.now()
        );
        history.add(record);
        System.out.println("Logged: " + record);
    }
    
    public void logConfigChange(String service, String key, String oldValue, String newValue, String changedBy) {
        ChangeRecord record = new ChangeRecord(
            "CONFIG_CHANGE",
            service,
            key + ": " + oldValue + " -> " + newValue,
            changedBy,
            LocalDateTime.now()
        );
        history.add(record);
        System.out.println("Logged: " + record);
    }
    
    public void logRollback(String service, String fromVersion, String toVersion, String reason) {
        ChangeRecord record = new ChangeRecord(
            "ROLLBACK",
            service,
            "Rolled back from " + fromVersion + " to " + toVersion + ": " + reason,
            "system",
            LocalDateTime.now()
        );
        history.add(record);
        System.out.println("Logged: " + record);
    }
    
    public void showHistory() {
        System.out.println("\n=== Deployment History ===");
        history.forEach(System.out::println);
    }
}
class ChangeRecord {
    String type, service, description, user;
    LocalDateTime timestamp;
    ChangeRecord(String type, String service, String description, String user, LocalDateTime timestamp) {
        this.type = type;
        this.service = service;
        this.description = description;
        this.user = user;
        this.timestamp = timestamp;
    }
    public String toString() {
        return String.format("[%s] %s - %s: %s (by %s)", timestamp.toLocalTime(), type, service, description, user);
    }
}
