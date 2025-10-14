package Concurrency.HalfSyncHalfAsync;

import java.util.concurrent.*;

/**
 * Half-Sync/Half-Async Pattern Implementation
 *
 * Decouples async and sync processing in concurrent systems by introducing
 * a queuing layer between them.
 */
public class HalfSyncHalfAsyncImpl {
    
    private final BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);
    private final ExecutorService syncLayer = Executors.newFixedThreadPool(2);
    private volatile boolean running = true;
    
    public HalfSyncHalfAsyncImpl() {
        // Sync layer workers
        for (int i = 0; i < 2; i++) {
            final int id = i;
            syncLayer.execute(() -> {
                while (running) {
                    try {
                        String task = queue.take();
                        System.out.println("Sync-Worker-" + id + " processing: " + task);
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
    }
    
    public void asyncRequest(String request) {
        System.out.println("Async layer received: " + request);
        queue.offer(request);
    }
    
    public void shutdown() {
        running = false;
        syncLayer.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Half-Sync/Half-Async Pattern Demonstration ===\n");
        
        for (int i = 1; i <= 5; i++) {
            asyncRequest("Request-" + i);
        }
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nHalf-Sync/Half-Async demonstration complete");
    }
}
