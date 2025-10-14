package Microservices.LogAggregation;
import java.time.*;
import java.util.*;
public class LogAggregator {
    private List<LogEntry> logs = new ArrayList<>();
    
    public void receiveLog(String service, String level, String message) {
        LogEntry entry = new LogEntry(service, level, message, LocalDateTime.now());
        logs.add(entry);
        System.out.println("Received: " + entry);
    }
    
    public void search(String serviceName) {
        System.out.println("Logs for " + serviceName + ":");
        logs.stream()
            .filter(log -> log.service.equals(serviceName))
            .forEach(log -> System.out.println("  " + log));
    }
    
    public void analyzeErrors() {
        long errorCount = logs.stream().filter(log -> log.level.equals("ERROR")).count();
        System.out.println("Total errors: " + errorCount);
        logs.stream()
            .filter(log -> log.level.equals("ERROR"))
            .forEach(log -> System.out.println("  " + log));
    }
}
class LogEntry {
    String service, level, message;
    LocalDateTime timestamp;
    LogEntry(String service, String level, String message, LocalDateTime timestamp) {
        this.service = service;
        this.level = level;
        this.message = message;
        this.timestamp = timestamp;
    }
    public String toString() {
        return String.format("[%s] [%s] %s: %s", timestamp.toLocalTime(), level, service, message);
    }
}
