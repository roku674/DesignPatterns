package Concurrency.MonitorObject;

import java.util.LinkedList;
import java.util.Queue;

/**
 * MonitorObject Pattern Implementation
 *
 * The Monitor Object pattern synchronizes concurrent method execution to ensure
 * that only one method at a time runs within an object. It also allows threads to
 * cooperatively schedule their access to the object using condition variables.
 *
 * Key Components:
 * - Monitor Lock: Ensures mutual exclusion
 * - Condition Variables: Enable thread cooperation
 * - Synchronized Methods: Protect shared state
 *
 * This implementation demonstrates a thread-safe bounded buffer.
 */
public class MonitorObjectImpl {

    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity;

    /**
     * Constructs a bounded buffer with specified capacity.
     *
     * @param capacity Maximum number of elements
     */
    public MonitorObjectImpl(int capacity) {
        this.capacity = capacity;
    }

    /**
     * Default constructor with capacity of 5.
     */
    public MonitorObjectImpl() {
        this(5);
    }

    /**
     * Puts an item into the buffer. Blocks if buffer is full.
     *
     * @param item The item to add
     */
    public synchronized void put(int item) throws InterruptedException {
        while (queue.size() == capacity) {
            System.out.println(Thread.currentThread().getName() +
                " waiting - buffer full (" + queue.size() + "/" + capacity + ")");
            wait();
        }

        queue.offer(item);
        System.out.println(Thread.currentThread().getName() +
            " produced: " + item + " [size=" + queue.size() + "]");
        notifyAll();
    }

    /**
     * Takes an item from the buffer. Blocks if buffer is empty.
     *
     * @return The item removed from buffer
     */
    public synchronized int take() throws InterruptedException {
        while (queue.isEmpty()) {
            System.out.println(Thread.currentThread().getName() +
                " waiting - buffer empty");
            wait();
        }

        int item = queue.poll();
        System.out.println(Thread.currentThread().getName() +
            " consumed: " + item + " [size=" + queue.size() + "]");
        notifyAll();
        return item;
    }

    /**
     * Returns current size of the buffer.
     *
     * @return Number of items in buffer
     */
    public synchronized int size() {
        return queue.size();
    }

    /**
     * Demonstrates the MonitorObject pattern with producer-consumer scenario.
     */
    public void demonstrate() {
        System.out.println("=== Monitor Object Pattern Demonstration ===\n");

        // Scenario 1: Single producer and consumer
        System.out.println("Scenario 1: Single Producer-Consumer");
        System.out.println("-".repeat(50));

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    put(i);
                    Thread.sleep(300);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    take();
                    Thread.sleep(500);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Consumer");

        producer.start();
        consumer.start();

        try {
            producer.join();
            consumer.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("\nScenario 1 completed\n");

        // Scenario 2: Multiple producers and consumers
        System.out.println("Scenario 2: Multiple Producers and Consumers");
        System.out.println("-".repeat(50));

        Thread[] producers = new Thread[2];
        Thread[] consumers = new Thread[2];

        for (int i = 0; i < 2; i++) {
            final int id = i;
            producers[i] = new Thread(() -> {
                try {
                    for (int j = 1; j <= 3; j++) {
                        put(id * 10 + j);
                        Thread.sleep(400);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Producer-" + i);

            consumers[i] = new Thread(() -> {
                try {
                    for (int j = 1; j <= 3; j++) {
                        take();
                        Thread.sleep(600);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Consumer-" + i);
        }

        for (int i = 0; i < 2; i++) {
            producers[i].start();
            consumers[i].start();
        }

        try {
            for (int i = 0; i < 2; i++) {
                producers[i].join();
                consumers[i].join();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("\nScenario 2 completed");
        System.out.println("\nMonitor Object demonstration complete");
    }
}
