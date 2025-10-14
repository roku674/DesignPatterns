package Concurrency.ThreadSafeInterface;

import java.util.*;

/**
 * ThreadSafeInterface Pattern Implementation
 *
 * Provides thread-safe wrappers around non-thread-safe classes,
 * presenting a synchronized interface to clients.
 */
public class ThreadSafeInterfaceImpl {
    
    static class ThreadSafeList<T> {
        private final List<T> list = new ArrayList<>();
        
        public synchronized void add(T item) {
            list.add(item);
            System.out.println(Thread.currentThread().getName() + " added: " + item);
        }
        
        public synchronized T get(int index) {
            T item = list.get(index);
            System.out.println(Thread.currentThread().getName() + " got: " + item);
            return item;
        }
        
        public synchronized int size() {
            return list.size();
        }
        
        public synchronized void clear() {
            list.clear();
            System.out.println(Thread.currentThread().getName() + " cleared list");
        }
    }
    
    static class ThreadSafeCounter {
        private int count = 0;
        
        public synchronized void increment() {
            count++;
        }
        
        public synchronized void decrement() {
            count--;
        }
        
        public synchronized int getCount() {
            return count;
        }
    }
    
    public void demonstrate() {
        System.out.println("=== ThreadSafeInterface Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Thread-Safe List");
        System.out.println("-".repeat(50));
        
        ThreadSafeList<String> safeList = new ThreadSafeList<>();
        
        Thread[] writers = new Thread[3];
        for (int i = 0; i < writers.length; i++) {
            final int id = i;
            writers[i] = new Thread(() -> {
                safeList.add("Item-" + id);
            }, "Writer-" + i);
            writers[i].start();
        }
        
        for (Thread t : writers) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nScenario 2: Thread-Safe Counter");
        System.out.println("-".repeat(50));
        
        ThreadSafeCounter counter = new ThreadSafeCounter();
        Thread[] incrementers = new Thread[5];
        for (int i = 0; i < incrementers.length; i++) {
            incrementers[i] = new Thread(() -> {
                for (int j = 0; j < 10; j++) {
                    counter.increment();
                }
            }, "Incrementer-" + i);
            incrementers[i].start();
        }
        
        for (Thread t : incrementers) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("Final counter value: " + counter.getCount());
        System.out.println("\nThreadSafeInterface demonstration complete");
    }
}
