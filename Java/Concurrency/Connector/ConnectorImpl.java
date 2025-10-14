package Concurrency.Connector;

import java.util.concurrent.*;

/**
 * Connector Pattern Implementation
 *
 * Decouples active connection establishment from service initialization.
 * Actively initiates connections to remote services.
 */
public class ConnectorImpl {
    
    private final ExecutorService connectionPool = Executors.newFixedThreadPool(2);
    
    interface ConnectionHandler {
        void onConnected(String service);
        void onFailed(String service, Exception e);
    }
    
    public void connect(String service, ConnectionHandler handler) {
        System.out.println("Initiating connection to: " + service);
        connectionPool.execute(() -> {
            try {
                // Simulate connection attempt
                Thread.sleep(500);
                if (Math.random() > 0.2) {
                    System.out.println("Connected to: " + service);
                    handler.onConnected(service);
                } else {
                    throw new Exception("Connection failed");
                }
            } catch (Exception e) {
                System.out.println("Failed to connect to: " + service);
                handler.onFailed(service, e);
            }
        });
    }
    
    public void shutdown() {
        connectionPool.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Connector Pattern Demonstration ===\n");
        
        ConnectionHandler handler = new ConnectionHandler() {
            public void onConnected(String service) {
                System.out.println("Handler: Successfully connected to " + service);
            }
            public void onFailed(String service, Exception e) {
                System.out.println("Handler: Connection failed for " + service);
            }
        };
        
        connect("ServiceA", handler);
        connect("ServiceB", handler);
        connect("ServiceC", handler);
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nConnector demonstration complete");
    }
}
