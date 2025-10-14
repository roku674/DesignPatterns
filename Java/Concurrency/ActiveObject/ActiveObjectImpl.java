package Concurrency.ActiveObject;

import java.util.concurrent.*;

/**
 * ActiveObject Pattern Implementation
 *
 * Decouples method execution from method invocation to enhance concurrency
 * and simplify synchronized access to objects in multi-threaded programs.
 */
public class ActiveObjectImpl {
    
    private final ExecutorService scheduler = Executors.newSingleThreadExecutor();
    private final BlockingQueue<Runnable> activationQueue = new LinkedBlockingQueue<>();
    private volatile boolean running = true;
    private int value = 0;
    
    public ActiveObjectImpl() {
        // Start the scheduler thread
        scheduler.execute(() -> {
            while (running) {
                try {
                    Runnable request = activationQueue.take();
                    request.run();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }
    
    /**
     * Asynchronously increments the value.
     *
     * @return Future containing the result
     */
    public Future<Integer> increment() {
        CompletableFuture<Integer> future = new CompletableFuture<>();
        activationQueue.offer(() -> {
            value++;
            System.out.println("Incremented to: " + value);
            future.complete(value);
        });
        return future;
    }
    
    /**
     * Asynchronously retrieves the current value.
     *
     * @return Future containing the current value
     */
    public Future<Integer> getValue() {
        CompletableFuture<Integer> future = new CompletableFuture<>();
        activationQueue.offer(() -> {
            System.out.println("Getting value: " + value);
            future.complete(value);
        });
        return future;
    }
    
    /**
     * Shuts down the active object.
     */
    public void shutdown() {
        running = false;
        scheduler.shutdown();
    }
    
    /**
     * Demonstrates the ActiveObject pattern.
     */
    public void demonstrate() {
        System.out.println("=== ActiveObject Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Asynchronous Method Invocations");
        System.out.println("-".repeat(50));
        
        try {
            Future<Integer> f1 = increment();
            Future<Integer> f2 = increment();
            Future<Integer> f3 = getValue();
            
            System.out.println("Result 1: " + f1.get());
            System.out.println("Result 2: " + f2.get());
            System.out.println("Result 3: " + f3.get());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        shutdown();
        System.out.println("\nActiveObject demonstration complete");
    }
}
