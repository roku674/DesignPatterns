package Concurrency.Balking;

/**
 * Balking Pattern Implementation
 *
 * Executes an action only if the object is in an appropriate state.
 * If the object is not in the right state, the method returns immediately
 * without performing the action ("balks").
 */
public class BalkingImpl {
    
    private boolean initialized = false;
    private boolean jobInProgress = false;
    
    /**
     * Initializes the object. Only executes if not already initialized.
     */
    public synchronized void initialize() {
        if (initialized) {
            System.out.println("Already initialized - balking");
            return;
        }
        
        System.out.println("Initializing...");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        initialized = true;
        System.out.println("Initialization complete");
    }
    
    /**
     * Starts a job. Only executes if no job is in progress.
     *
     * @return true if job started, false if balked
     */
    public synchronized boolean startJob() {
        if (jobInProgress) {
            System.out.println(Thread.currentThread().getName() + 
                ": Job already in progress - balking");
            return false;
        }
        
        if (!initialized) {
            System.out.println(Thread.currentThread().getName() + 
                ": Not initialized - balking");
            return false;
        }
        
        jobInProgress = true;
        System.out.println(Thread.currentThread().getName() + ": Starting job");
        
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                synchronized (BalkingImpl.this) {
                    jobInProgress = false;
                    System.out.println("Job completed");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
        
        return true;
    }
    
    /**
     * Demonstrates the Balking pattern.
     */
    public void demonstrate() {
        System.out.println("=== Balking Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Attempting job before initialization");
        System.out.println("-".repeat(50));
        startJob(); // Will balk - not initialized
        
        System.out.println("\nScenario 2: Initialize twice");
        System.out.println("-".repeat(50));
        initialize();
        initialize(); // Will balk - already initialized
        
        System.out.println("\nScenario 3: Multiple job attempts");
        System.out.println("-".repeat(50));
        startJob(); // Will start
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        startJob(); // Will balk - job in progress
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        startJob(); // Will balk - job in progress
        
        try { Thread.sleep(3000); } catch (InterruptedException e) {}
        System.out.println("\nBalking demonstration complete");
    }
}
