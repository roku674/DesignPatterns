package Concurrency.DoubleCheckedLocking;

/**
 * DoubleCheckedLocking Pattern Implementation
 *
 * Reduces synchronization overhead in lazy singleton initialization
 * by checking the instance twice - once without locking and once with locking.
 * Uses volatile keyword to ensure proper visibility across threads.
 */
public class DoubleCheckedLockingImpl {
    
    private static volatile DoubleCheckedLockingImpl instance;
    private final String data;
    
    /**
     * Private constructor prevents direct instantiation.
     */
    private DoubleCheckedLockingImpl() {
        this.data = "Singleton Instance Created at " + System.currentTimeMillis();
        System.out.println("Instance created by: " + Thread.currentThread().getName());
    }
    
    /**
     * Returns the singleton instance using double-checked locking.
     * First check without synchronization for performance.
     * Second check with synchronization for thread safety.
     *
     * @return The singleton instance
     */
    public static DoubleCheckedLockingImpl getInstance() {
        // First check (no locking)
        if (instance == null) {
            synchronized (DoubleCheckedLockingImpl.class) {
                // Second check (with locking)
                if (instance == null) {
                    instance = new DoubleCheckedLockingImpl();
                }
            }
        }
        return instance;
    }
    
    /**
     * Returns the instance data.
     *
     * @return Instance data string
     */
    public String getData() {
        return data;
    }
    
    /**
     * Demonstrates the DoubleCheckedLocking pattern.
     */
    public void demonstrate() {
        System.out.println("=== Double-Checked Locking Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Multiple Threads Accessing Singleton");
        System.out.println("-".repeat(50));
        
        Thread[] threads = new Thread[5];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                DoubleCheckedLockingImpl inst = getInstance();
                System.out.println(Thread.currentThread().getName() + 
                    " got instance: " + System.identityHashCode(inst));
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread t : threads) {
            try {
                t.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("\nAll threads received same instance: " + 
            System.identityHashCode(getInstance()));
        System.out.println("\nDouble-Checked Locking demonstration complete");
    }
}
