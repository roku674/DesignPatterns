package Microservices.ExceptionTracking;
import java.util.*;
public class ExceptionTracker {
    private List<ExceptionRecord> exceptions = new ArrayList<>();
    
    public void trackException(Exception e, String service, String method) {
        ExceptionRecord record = new ExceptionRecord(
            UUID.randomUUID().toString(),
            service,
            method,
            e.getClass().getSimpleName(),
            e.getMessage(),
            System.currentTimeMillis()
        );
        exceptions.add(record);
        System.out.println("Exception tracked: " + record);
        sendAlert(record);
    }
    
    private void sendAlert(ExceptionRecord record) {
        System.out.println("  Alert sent to ops team!");
    }
    
    public void showDashboard() {
        System.out.println("\n=== Exception Dashboard ===");
        System.out.println("Total Exceptions: " + exceptions.size());
        exceptions.forEach(System.out::println);
    }
}
class ExceptionRecord {
    String id, service, method, type, message;
    long timestamp;
    ExceptionRecord(String id, String service, String method, String type, String message, long timestamp) {
        this.id = id;
        this.service = service;
        this.method = method;
        this.type = type;
        this.message = message;
        this.timestamp = timestamp;
    }
    public String toString() {
        return String.format("[%s] %s.%s: %s - %s", id.substring(0, 8), service, method, type, message);
    }
}
