package Concurrency.ProactorPattern;

import java.util.concurrent.*;

/**
 * Proactor Pattern Implementation
 *
 * Handles asynchronous operations by allowing applications to initiate
 * operations and receive completion notifications.
 */
public class ProactorPatternImpl {
    
    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(3);
    
    interface CompletionHandler<T> {
        void onComplete(T result);
        void onError(Exception e);
    }
    
    public <T> void asyncRead(Callable<T> operation, CompletionHandler<T> handler) {
        System.out.println("Initiating async read operation...");
        asyncExecutor.submit(() -> {
            try {
                T result = operation.call();
                handler.onComplete(result);
            } catch (Exception e) {
                handler.onError(e);
            }
        });
    }
    
    public void shutdown() {
        asyncExecutor.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Proactor Pattern Demonstration ===\n");
        
        asyncRead(() -> {
            System.out.println("Reading data asynchronously...");
            Thread.sleep(1000);
            return "Data from async operation";
        }, new CompletionHandler<String>() {
            public void onComplete(String result) {
                System.out.println("Async operation completed: " + result);
            }
            public void onError(Exception e) {
                System.err.println("Async operation failed: " + e.getMessage());
            }
        });
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nProactor demonstration complete");
    }
}
