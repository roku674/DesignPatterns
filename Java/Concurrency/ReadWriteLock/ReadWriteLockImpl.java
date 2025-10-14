package Concurrency.ReadWriteLock;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * ReadWriteLock Pattern Implementation
 *
 * Allows multiple concurrent readers OR a single writer.
 * Improves performance when reads are much more frequent than writes.
 */
public class ReadWriteLockImpl {
    
    private final Map<String, String> cache = new HashMap<>();
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final Lock readLock = rwLock.readLock();
    private final Lock writeLock = rwLock.writeLock();
    
    /**
     * Reads a value from the cache (multiple readers allowed).
     *
     * @param key The key to read
     * @return The value, or null if not found
     */
    public String read(String key) {
        readLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + 
                " reading key: " + key);
            Thread.sleep(100); // Simulate read operation
            return cache.get(key);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        } finally {
            readLock.unlock();
        }
    }
    
    /**
     * Writes a value to the cache (exclusive access required).
     *
     * @param key The key to write
     * @param value The value to write
     */
    public void write(String key, String value) {
        writeLock.lock();
        try {
            System.out.println(Thread.currentThread().getName() + 
                " writing key: " + key + " = " + value);
            Thread.sleep(200); // Simulate write operation
            cache.put(key, value);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            writeLock.unlock();
        }
    }
    
    /**
     * Returns the number of entries in the cache.
     *
     * @return Cache size
     */
    public int size() {
        readLock.lock();
        try {
            return cache.size();
        } finally {
            readLock.unlock();
        }
    }
    
    /**
     * Demonstrates the ReadWriteLock pattern.
     */
    public void demonstrate() {
        System.out.println("=== ReadWriteLock Pattern Demonstration ===\n");
        
        // Initialize some data
        write("key1", "value1");
        write("key2", "value2");
        
        System.out.println("\nScenario 1: Multiple Concurrent Readers");
        System.out.println("-".repeat(50));
        
        Thread[] readers = new Thread[5];
        for (int i = 0; i < readers.length; i++) {
            readers[i] = new Thread(() -> {
                read("key1");
                read("key2");
            }, "Reader-" + i);
            readers[i].start();
        }
        
        for (Thread t : readers) {
            try {
                t.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("\nScenario 2: Mixed Readers and Writers");
        System.out.println("-".repeat(50));
        
        Thread writer = new Thread(() -> {
            write("key3", "value3");
            write("key4", "value4");
        }, "Writer");
        
        Thread reader1 = new Thread(() -> {
            read("key1");
            read("key3");
        }, "Reader-A");
        
        Thread reader2 = new Thread(() -> {
            read("key2");
            read("key4");
        }, "Reader-B");
        
        writer.start();
        reader1.start();
        reader2.start();
        
        try {
            writer.join();
            reader1.join();
            reader2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        System.out.println("\nFinal cache size: " + size());
        System.out.println("\nReadWriteLock demonstration complete");
    }
}
