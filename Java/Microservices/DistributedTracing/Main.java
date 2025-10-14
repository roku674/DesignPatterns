package Microservices.DistributedTracing;
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Distributed Tracing Pattern ===\n");
        
        TraceContext traceContext = new TraceContext();
        
        System.out.println("=== Tracing Request Across Services ===");
        traceContext.startTrace("web-request-123");
        
        traceContext.startSpan("API Gateway", "route-request");
        simulateWork(50);
        traceContext.endSpan();
        
        traceContext.startSpan("User Service", "get-user");
        simulateWork(100);
        traceContext.endSpan();
        
        traceContext.startSpan("Order Service", "get-orders");
        simulateWork(150);
        traceContext.endSpan();
        
        traceContext.startSpan("API Gateway", "aggregate-response");
        simulateWork(30);
        traceContext.endSpan();
        
        traceContext.endTrace();
        
        System.out.println("\n=== Trace Summary ===");
        traceContext.printTrace();
    }
    
    private static void simulateWork(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) {}
    }
}
