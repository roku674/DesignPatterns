package Concurrency.AsynchronousCompletionToken;

import java.util.concurrent.*;

/**
 * Asynchronous Completion Token Pattern Implementation
 *
 * Associates asynchronous operation results with their initiating context
 * by passing a completion token that is returned with the result.
 */
public class AsynchronousCompletionTokenImpl {
    
    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    
    static class CompletionToken {
        final String requestId;
        final Object context;
        
        CompletionToken(String requestId, Object context) {
            this.requestId = requestId;
            this.context = context;
        }
    }
    
    interface CompletionCallback {
        void onComplete(CompletionToken token, String result);
    }
    
    public void asyncOperation(CompletionToken token, CompletionCallback callback) {
        System.out.println("Starting async operation for: " + token.requestId);
        executor.submit(() -> {
            try {
                Thread.sleep(1000);
                String result = "Result for " + token.requestId;
                callback.onComplete(token, result);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
    
    public void shutdown() {
        executor.shutdown();
    }
    
    public void demonstrate() {
        System.out.println("=== Asynchronous Completion Token Pattern Demonstration ===\n");
        
        CompletionCallback callback = (token, result) -> {
            System.out.println("Completed: " + result + " (context: " + token.context + ")");
        };
        
        asyncOperation(new CompletionToken("REQ-1", "Context-A"), callback);
        asyncOperation(new CompletionToken("REQ-2", "Context-B"), callback);
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        shutdown();
        System.out.println("\nAsynchronous Completion Token demonstration complete");
    }
}
