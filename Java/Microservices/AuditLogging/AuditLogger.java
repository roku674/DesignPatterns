package Microservices.AuditLogging;
import java.time.*;
import java.util.*;
public class AuditLogger {
    private List<AuditEntry> auditTrail = new ArrayList<>();
    
    public void logAction(String userId, String action, String resource, String resourceId, String description) {
        AuditEntry entry = new AuditEntry(userId, action, resource, resourceId, description, LocalDateTime.now());
        auditTrail.add(entry);
        System.out.println("AUDIT: " + entry);
    }
    
    public void logAccess(String userId, String resource, String result) {
        System.out.println("ACCESS: User " + userId + " attempted " + resource + " -> " + result);
    }
    
    public void showAuditTrail() {
        System.out.println("\n=== Complete Audit Trail ===");
        auditTrail.forEach(System.out::println);
    }
}
class AuditEntry {
    String userId, action, resource, resourceId, description;
    LocalDateTime timestamp;
    
    AuditEntry(String userId, String action, String resource, String resourceId, String description, LocalDateTime timestamp) {
        this.userId = userId;
        this.action = action;
        this.resource = resource;
        this.resourceId = resourceId;
        this.description = description;
        this.timestamp = timestamp;
    }
    
    public String toString() {
        return String.format("[%s] %s %s %s (%s) - %s", timestamp, userId, action, resource, resourceId, description);
    }
}
