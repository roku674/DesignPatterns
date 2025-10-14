package Concurrency.LeaderFollowers;

import java.util.concurrent.*;

/**
 * Leader-Followers Pattern Implementation
 *
 * Multiple threads take turns being the leader that waits for events.
 * When an event arrives, the leader processes it and promotes a follower to leader.
 */
public class LeaderFollowersImpl {
    
    private final BlockingQueue<String> eventQueue = new LinkedBlockingQueue<>();
    private final Semaphore leaderLock = new Semaphore(1);
    private volatile boolean running = true;
    
    class WorkerThread extends Thread {
        WorkerThread(String name) {
            super(name);
        }
        
        public void run() {
            while (running) {
                try {
                    // Try to become leader
                    leaderLock.acquire();
                    System.out.println(getName() + " became LEADER");
                    
                    // Wait for event as leader
                    String event = eventQueue.poll(1, TimeUnit.SECONDS);
                    
                    if (event != null) {
                        // Promote next follower to leader
                        leaderLock.release();
                        System.out.println(getName() + " promoted follower, processing: " + event);
                        
                        // Process event
                        Thread.sleep(500);
                        System.out.println(getName() + " completed processing");
                    } else {
                        leaderLock.release();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    public void submitEvent(String event) {
        eventQueue.offer(event);
    }
    
    public void shutdown() {
        running = false;
    }
    
    public void demonstrate() {
        System.out.println("=== Leader-Followers Pattern Demonstration ===\n");
        
        WorkerThread[] workers = new WorkerThread[3];
        for (int i = 0; i < workers.length; i++) {
            workers[i] = new WorkerThread("Worker-" + i);
            workers[i].start();
        }
        
        try { Thread.sleep(500); } catch (InterruptedException e) {}
        
        for (int i = 1; i <= 5; i++) {
            submitEvent("Event-" + i);
            try { Thread.sleep(300); } catch (InterruptedException e) {}
        }
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        shutdown();
        
        for (WorkerThread w : workers) {
            try { w.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nLeader-Followers demonstration complete");
    }
}
