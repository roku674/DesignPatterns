package Concurrency.DoubleCheckedLockingOptimization;

/**
 * DoubleCheckedLockingOptimization Pattern Implementation
 *
 * An optimized version of double-checked locking using initialization-on-demand holder idiom,
 * which guarantees thread safety without explicit synchronization.
 */
public class DoubleCheckedLockingOptimizationImpl {
    
    private DoubleCheckedLockingOptimizationImpl() {
        System.out.println("Singleton instance created");
    }
    
    /**
     * Initialization-on-demand holder idiom.
     * The JVM guarantees that the holder class is not initialized until it's referenced.
     */
    private static class InstanceHolder {
        private static final DoubleCheckedLockingOptimizationImpl INSTANCE = 
            new DoubleCheckedLockingOptimizationImpl();
    }
    
    public static DoubleCheckedLockingOptimizationImpl getInstance() {
        return InstanceHolder.INSTANCE;
    }
    
    public void demonstrate() {
        System.out.println("=== Double-Checked Locking Optimization Demonstration ===\n");
        
        Thread[] threads = new Thread[5];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                DoubleCheckedLockingOptimizationImpl inst = getInstance();
                System.out.println(Thread.currentThread().getName() + 
                    " got instance: " + System.identityHashCode(inst));
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nAll threads got same instance (lazy initialization)");
        System.out.println("Optimization demonstration complete");
    }
}
