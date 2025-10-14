package Microservices.DistributedTracing;
import java.util.*;
public class TraceContext {
    private String traceId;
    private long traceStart;
    private long traceEnd;
    private List<Span> spans = new ArrayList<>();
    private Span currentSpan;
    
    public void startTrace(String traceId) {
        this.traceId = traceId;
        this.traceStart = System.currentTimeMillis();
        System.out.println("Trace started: " + traceId);
    }
    
    public void startSpan(String serviceName, String operation) {
        currentSpan = new Span(serviceName, operation);
        currentSpan.start = System.currentTimeMillis();
        System.out.println("  [" + serviceName + "] Starting: " + operation);
    }
    
    public void endSpan() {
        if (currentSpan != null) {
            currentSpan.end = System.currentTimeMillis();
            currentSpan.duration = currentSpan.end - currentSpan.start;
            spans.add(currentSpan);
            System.out.println("  [" + currentSpan.serviceName + "] Completed: " + currentSpan.operation + " (" + currentSpan.duration + "ms)");
        }
    }
    
    public void endTrace() {
        this.traceEnd = System.currentTimeMillis();
        System.out.println("Trace completed: " + traceId);
    }
    
    public void printTrace() {
        System.out.println("Trace ID: " + traceId);
        System.out.println("Total Duration: " + (traceEnd - traceStart) + "ms");
        System.out.println("Spans:");
        for (Span span : spans) {
            System.out.println("  " + span);
        }
    }
}
class Span {
    String serviceName, operation;
    long start, end, duration;
    Span(String serviceName, String operation) {
        this.serviceName = serviceName;
        this.operation = operation;
    }
    public String toString() {
        return String.format("%s.%s: %dms", serviceName, operation, duration);
    }
}
