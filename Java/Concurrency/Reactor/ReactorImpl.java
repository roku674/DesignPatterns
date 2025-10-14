package Concurrency.Reactor;

import java.util.*;
import java.util.concurrent.*;

/**
 * Reactor Pattern Implementation
 *
 * Demultiplexes and dispatches events from multiple sources synchronously.
 * A single-threaded event loop handles all events sequentially.
 */
public class ReactorImpl {
    
    interface EventHandler {
        void handle(String event);
    }
    
    private final Map<String, EventHandler> handlers = new ConcurrentHashMap<>();
    private final BlockingQueue<String> eventQueue = new LinkedBlockingQueue<>();
    private volatile boolean running = true;
    
    public ReactorImpl() {
        new Thread(() -> {
            while (running) {
                try {
                    String event = eventQueue.take();
                    String[] parts = event.split(":", 2);
                    EventHandler handler = handlers.get(parts[0]);
                    if (handler != null) {
                        handler.handle(parts[1]);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Reactor-Loop").start();
    }
    
    public void registerHandler(String eventType, EventHandler handler) {
        handlers.put(eventType, handler);
    }
    
    public void dispatchEvent(String eventType, String data) {
        eventQueue.offer(eventType + ":" + data);
    }
    
    public void shutdown() {
        running = false;
    }
    
    public void demonstrate() {
        System.out.println("=== Reactor Pattern Demonstration ===\n");
        
        registerHandler("HTTP", event -> 
            System.out.println("HTTP Handler: " + event));
        registerHandler("WS", event -> 
            System.out.println("WebSocket Handler: " + event));
        
        dispatchEvent("HTTP", "GET /index.html");
        dispatchEvent("WS", "Message received");
        dispatchEvent("HTTP", "POST /api/data");
        
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nReactor demonstration complete");
    }
}
