package Concurrency.ReactorPattern;

import java.util.*;
import java.util.concurrent.*;

/**
 * Reactor Pattern Implementation
 *
 * Handles service requests delivered concurrently by demultiplexing
 * and dispatching them synchronously to associated request handlers.
 */
public class ReactorPatternImpl {
    
    private final Map<String, EventHandler> handlers = new ConcurrentHashMap<>();
    private final BlockingQueue<Event> eventQueue = new LinkedBlockingQueue<>();
    private volatile boolean running = true;
    
    static class Event {
        final String type;
        final String data;
        
        Event(String type, String data) {
            this.type = type;
            this.data = data;
        }
    }
    
    interface EventHandler {
        void handleEvent(Event event);
    }
    
    public ReactorPatternImpl() {
        // Start reactor thread
        new Thread(() -> {
            while (running) {
                try {
                    Event event = eventQueue.take();
                    EventHandler handler = handlers.get(event.type);
                    if (handler != null) {
                        handler.handleEvent(event);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Reactor").start();
    }
    
    public void registerHandler(String eventType, EventHandler handler) {
        handlers.put(eventType, handler);
        System.out.println("Registered handler for: " + eventType);
    }
    
    public void submitEvent(String type, String data) {
        eventQueue.offer(new Event(type, data));
    }
    
    public void shutdown() {
        running = false;
    }
    
    public void demonstrate() {
        System.out.println("=== Reactor Pattern Demonstration ===\n");
        
        registerHandler("READ", event -> 
            System.out.println("READ handler: " + event.data));
        registerHandler("WRITE", event -> 
            System.out.println("WRITE handler: " + event.data));
        
        submitEvent("READ", "Data chunk 1");
        submitEvent("WRITE", "Data chunk 2");
        submitEvent("READ", "Data chunk 3");
        
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nReactor demonstration complete");
    }
}
