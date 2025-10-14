package Concurrency.StrategizedLocking;

import java.util.concurrent.locks.*;

/**
 * StrategizedLocking Pattern Implementation
 *
 * Parameterizes synchronization mechanisms so that different locking
 * strategies can be selected at runtime or compile time.
 */
public class StrategizedLockingImpl {
    
    interface LockingStrategy {
        void acquire();
        void release();
        String getStrategyName();
    }
    
    static class MutexStrategy implements LockingStrategy {
        private final Lock lock = new ReentrantLock();
        public void acquire() { lock.lock(); }
        public void release() { lock.unlock(); }
        public String getStrategyName() { return "Mutex (ReentrantLock)"; }
    }
    
    static class ReadLockStrategy implements LockingStrategy {
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final Lock readLock = rwLock.readLock();
        public void acquire() { readLock.lock(); }
        public void release() { readLock.unlock(); }
        public String getStrategyName() { return "ReadLock"; }
    }
    
    static class WriteLockStrategy implements LockingStrategy {
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final Lock writeLock = rwLock.writeLock();
        public void acquire() { writeLock.lock(); }
        public void release() { writeLock.unlock(); }
        public String getStrategyName() { return "WriteLock"; }
    }
    
    private LockingStrategy strategy;
    private int counter = 0;
    
    public void setLockingStrategy(LockingStrategy strategy) {
        this.strategy = strategy;
        System.out.println("Using strategy: " + strategy.getStrategyName());
    }
    
    public void performOperation() {
        strategy.acquire();
        try {
            counter++;
            System.out.println(Thread.currentThread().getName() + 
                " performed operation with " + strategy.getStrategyName() + 
                ", counter: " + counter);
        } finally {
            strategy.release();
        }
    }
    
    public void demonstrate() {
        System.out.println("=== StrategizedLocking Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Mutex Strategy");
        System.out.println("-".repeat(50));
        setLockingStrategy(new MutexStrategy());
        runThreads();
        
        System.out.println("\nScenario 2: Write Lock Strategy");
        System.out.println("-".repeat(50));
        counter = 0;
        setLockingStrategy(new WriteLockStrategy());
        runThreads();
        
        System.out.println("\nStrategizedLocking demonstration complete");
    }
    
    private void runThreads() {
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> performOperation(), "Thread-" + i);
            threads[i].start();
        }
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
    }
}
