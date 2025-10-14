package Concurrency.Proactor;

import java.util.concurrent.*;

/**
 * Proactor Pattern Implementation
 *
 * Demultiplexes and dispatches completion events from asynchronous operations.
 * The initiator starts async operations and completion handlers process results.
 */
public class ProactorImpl {
    
    private final ExecutorService asyncService = Executors.newFixedThreadPool(3);
    private final ExecutorService completionService = Executors.newSingleThreadExecutor();
    
    interface CompletionHandler<T> {
        void handleCompletion(T result);
    }
    
    public <T> void initiateAsyncOperation(Callable<T> operation, CompletionHandler<T> handler) {
        asyncService.submit(() -> {
            try {
                T result = operation.call();
                completionService.submit(() -> handler.handleCompletion(result));
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
    
    public void shutdown() {
        asyncService.shutdown();
        completionService.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Proactor Pattern Demonstration ===\n");
        
        initiateAsyncOperation(() -> {
            System.out.println("Async operation 1 executing...");
            Thread.sleep(800);
            return "Result-1";
        }, result -> System.out.println("Completed: " + result));
        
        initiateAsyncOperation(() -> {
            System.out.println("Async operation 2 executing...");
            Thread.sleep(500);
            return "Result-2";
        }, result -> System.out.println("Completed: " + result));
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nProactor demonstration complete");
    }
}
