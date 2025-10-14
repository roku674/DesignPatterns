package Concurrency.AcceptorConnector;

import java.util.concurrent.*;

/**
 * AcceptorConnector Pattern Implementation
 *
 * Combines Acceptor (passive) and Connector (active) patterns to handle
 * both incoming connections and outgoing connection establishment.
 */
public class AcceptorConnectorImpl {
    
    private final ExecutorService pool = Executors.newFixedThreadPool(4);
    private final BlockingQueue<String> incomingQueue = new LinkedBlockingQueue<>();
    private volatile boolean running = true;
    
    public AcceptorConnectorImpl() {
        // Acceptor thread
        new Thread(() -> {
            while (running) {
                try {
                    String connection = incomingQueue.take();
                    pool.execute(() -> handleIncoming(connection));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Acceptor").start();
    }
    
    public void acceptConnection(String clientId) {
        incomingQueue.offer(clientId);
        System.out.println("Accepted: " + clientId);
    }
    
    public void connectTo(String serviceId) {
        System.out.println("Connecting to: " + serviceId);
        pool.execute(() -> handleOutgoing(serviceId));
    }
    
    private void handleIncoming(String connection) {
        System.out.println("Handling incoming: " + connection);
        try { Thread.sleep(300); } catch (InterruptedException e) {}
    }
    
    private void handleOutgoing(String service) {
        try {
            Thread.sleep(400);
            System.out.println("Connected to: " + service);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void shutdown() {
        running = false;
        pool.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== AcceptorConnector Pattern Demonstration ===\n");
        
        acceptConnection("Client-1");
        connectTo("Service-A");
        acceptConnection("Client-2");
        connectTo("Service-B");
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nAcceptorConnector demonstration complete");
    }
}
