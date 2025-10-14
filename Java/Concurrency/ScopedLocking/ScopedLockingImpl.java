package Concurrency.ScopedLocking;

import java.util.concurrent.locks.*;

/**
 * ScopedLocking Pattern Implementation
 *
 * Implements RAII (Resource Acquisition Is Initialization) style locking
 * where locks are automatically released when leaving scope.
 * Uses try-with-resources for automatic lock management.
 */
public class ScopedLockingImpl {
    
    static class ScopedLock implements AutoCloseable {
        private final Lock lock;
        
        public ScopedLock(Lock lock) {
            this.lock = lock;
            this.lock.lock();
            System.out.println(Thread.currentThread().getName() + " acquired lock");
        }
        
        @Override
        public void close() {
            lock.unlock();
            System.out.println(Thread.currentThread().getName() + " released lock");
        }
    }
    
    private final Lock lock = new ReentrantLock();
    private int value = 0;
    
    public void incrementWithScopedLock() {
        try (ScopedLock scopedLock = new ScopedLock(lock)) {
            value++;
            System.out.println(Thread.currentThread().getName() + 
                " incremented to: " + value);
            // Lock automatically released when leaving try block
        }
    }
    
    public void demonstrate() {
        System.out.println("=== ScopedLocking Pattern Demonstration ===\n");
        
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                incrementWithScopedLock();
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                incrementWithScopedLock();
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nFinal value: " + value);
        System.out.println("ScopedLocking demonstration complete");
    }
}
