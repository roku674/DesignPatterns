package Concurrency.WrapperFacade;

import java.util.concurrent.locks.*;

/**
 * WrapperFacade Pattern Implementation
 *
 * Encapsulates complex concurrent APIs behind a simpler interface,
 * hiding low-level synchronization details from clients.
 */
public class WrapperFacadeImpl {
    
    // Complex internal state
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private int value = 0;
    private long lastModified = 0;
    
    /**
     * Simple increment operation (hides lock complexity).
     */
    public void increment() {
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
            value++;
            lastModified = System.currentTimeMillis();
            System.out.println("Incremented to: " + value);
        } finally {
            writeLock.unlock();
        }
    }
    
    /**
     * Simple read operation (hides lock complexity).
     *
     * @return Current value
     */
    public int getValue() {
        Lock readLock = lock.readLock();
        readLock.lock();
        try {
            System.out.println("Reading value: " + value);
            return value;
        } finally {
            readLock.unlock();
        }
    }
    
    /**
     * Get metadata (hides lock complexity).
     *
     * @return Last modified timestamp
     */
    public long getLastModified() {
        Lock readLock = lock.readLock();
        readLock.lock();
        try {
            return lastModified;
        } finally {
            readLock.unlock();
        }
    }
    
    public void demonstrate() {
        System.out.println("=== WrapperFacade Pattern Demonstration ===\n");
        
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                increment();
                getValue();
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nFinal value: " + getValue());
        System.out.println("Last modified: " + getLastModified());
        System.out.println("\nWrapperFacade demonstration complete");
    }
}
