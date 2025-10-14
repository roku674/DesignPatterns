package Concurrency.StrategyPattern;

import java.util.concurrent.locks.*;

/**
 * Strategy Pattern for Concurrency
 *
 * Defines a family of locking strategies and makes them interchangeable.
 * Allows the locking algorithm to vary independently from clients.
 */
public class StrategyPatternImpl {
    
    interface LockStrategy {
        void lock();
        void unlock();
        String getName();
    }
    
    static class ReentrantLockStrategy implements LockStrategy {
        private final ReentrantLock lock = new ReentrantLock();
        public void lock() { lock.lock(); }
        public void unlock() { lock.unlock(); }
        public String getName() { return "ReentrantLock"; }
    }
    
    static class ReadWriteLockStrategy implements LockStrategy {
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final Lock lock = rwLock.writeLock();
        public void lock() { lock.lock(); }
        public void unlock() { lock.unlock(); }
        public String getName() { return "ReadWriteLock"; }
    }
    
    static class SynchronizedStrategy implements LockStrategy {
        private final Object monitor = new Object();
        private boolean locked = false;
        
        public void lock() {
            synchronized (monitor) {
                while (locked) {
                    try { monitor.wait(); } catch (InterruptedException e) {}
                }
                locked = true;
            }
        }
        
        public void unlock() {
            synchronized (monitor) {
                locked = false;
                monitor.notify();
            }
        }
        
        public String getName() { return "Synchronized"; }
    }
    
    private LockStrategy strategy;
    private int counter = 0;
    
    public void setStrategy(LockStrategy strategy) {
        this.strategy = strategy;
        System.out.println("Using lock strategy: " + strategy.getName());
    }
    
    public void increment() {
        strategy.lock();
        try {
            counter++;
            System.out.println(Thread.currentThread().getName() + 
                " incremented with " + strategy.getName() + ": " + counter);
        } finally {
            strategy.unlock();
        }
    }
    
    public void demonstrate() {
        System.out.println("=== Strategy Pattern (Concurrency) Demonstration ===\n");
        
        // Test with ReentrantLock
        System.out.println("Scenario 1: ReentrantLock Strategy");
        System.out.println("-".repeat(50));
        setStrategy(new ReentrantLockStrategy());
        runThreads();
        
        // Test with ReadWriteLock
        System.out.println("\nScenario 2: ReadWriteLock Strategy");
        System.out.println("-".repeat(50));
        counter = 0;
        setStrategy(new ReadWriteLockStrategy());
        runThreads();
        
        System.out.println("\nStrategy pattern demonstration complete");
    }
    
    private void runThreads() {
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> increment(), "Thread-" + i);
            threads[i].start();
        }
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
    }
}
