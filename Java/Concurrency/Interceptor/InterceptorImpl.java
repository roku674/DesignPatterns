package Concurrency.Interceptor;

import java.util.*;
import java.util.concurrent.*;

/**
 * Interceptor Pattern Implementation
 *
 * Allows services to be added transparently to a framework and triggered
 * automatically when certain events occur. Uses a chain of interceptors.
 */
public class InterceptorImpl {
    
    interface Interceptor {
        void preProcess(Request request);
        void postProcess(Request request, Response response);
    }
    
    static class Request {
        String data;
        Map<String, Object> metadata = new ConcurrentHashMap<>();
        Request(String data) { this.data = data; }
    }
    
    static class Response {
        String result;
        Response(String result) { this.result = result; }
    }
    
    private final List<Interceptor> interceptors = new CopyOnWriteArrayList<>();
    
    public void addInterceptor(Interceptor interceptor) {
        interceptors.add(interceptor);
    }
    
    public Response processRequest(Request request) {
        // Pre-processing
        for (Interceptor interceptor : interceptors) {
            interceptor.preProcess(request);
        }
        
        // Main processing
        Response response = new Response("Processed: " + request.data);
        
        // Post-processing (reverse order)
        for (int i = interceptors.size() - 1; i >= 0; i--) {
            interceptors.get(i).postProcess(request, response);
        }
        
        return response;
    }
    
    public void demonstrate() {
        System.out.println("=== Interceptor Pattern Demonstration ===\n");
        
        addInterceptor(new Interceptor() {
            public void preProcess(Request req) {
                System.out.println("  [LoggingInterceptor] Before: " + req.data);
                req.metadata.put("logTime", System.currentTimeMillis());
            }
            public void postProcess(Request req, Response res) {
                System.out.println("  [LoggingInterceptor] After: " + res.result);
            }
        });
        
        addInterceptor(new Interceptor() {
            public void preProcess(Request req) {
                System.out.println("  [SecurityInterceptor] Validating request");
            }
            public void postProcess(Request req, Response res) {
                System.out.println("  [SecurityInterceptor] Validating response");
            }
        });
        
        Request request = new Request("Test Data");
        Response response = processRequest(request);
        System.out.println("\nFinal response: " + response.result);
        System.out.println("\nInterceptor demonstration complete");
    }
}
