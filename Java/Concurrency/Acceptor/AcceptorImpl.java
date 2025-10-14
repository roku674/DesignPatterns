package Concurrency.Acceptor;

import java.util.concurrent.*;

/**
 * Acceptor Pattern Implementation
 *
 * Decouples passive connection establishment from service processing.
 * Listens for connection requests and dispatches them to service handlers.
 */
public class AcceptorImpl {
    
    private final ExecutorService handlerPool = Executors.newFixedThreadPool(3);
    private final BlockingQueue<String> connectionQueue = new LinkedBlockingQueue<>();
    private volatile boolean accepting = true;
    
    public AcceptorImpl() {
        // Acceptor thread
        new Thread(() -> {
            while (accepting) {
                try {
                    String connection = connectionQueue.take();
                    System.out.println("Accepted connection: " + connection);
                    handlerPool.execute(() -> handleConnection(connection));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Acceptor").start();
    }
    
    private void handleConnection(String connection) {
        System.out.println("Handling connection: " + connection + 
            " on " + Thread.currentThread().getName());
        try {
            Thread.sleep(500);
            System.out.println("Completed handling: " + connection);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    public void acceptConnection(String clientId) {
        connectionQueue.offer(clientId);
    }
    
    public void shutdown() {
        accepting = false;
        handlerPool.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Acceptor Pattern Demonstration ===\n");
        
        for (int i = 1; i <= 5; i++) {
            acceptConnection("Client-" + i);
        }
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nAcceptor demonstration complete");
    }
}
