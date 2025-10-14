package Concurrency.ThreadSpecificStorage;

/**
 * ThreadSpecificStorage Pattern Implementation
 *
 * Provides thread-local storage where each thread has its own independent
 * copy of a variable. Changes made by one thread do not affect other threads.
 */
public class ThreadSpecificStorageImpl {
    
    private static ThreadLocal<Integer> threadId = new ThreadLocal<Integer>() {
        private int nextId = 1;
        
        @Override
        protected synchronized Integer initialValue() {
            return nextId++;
        }
    };
    
    private static ThreadLocal<UserContext> userContext = ThreadLocal.withInitial(UserContext::new);
    
    static class UserContext {
        private String username = "guest";
        private int requestCount = 0;
        
        public void setUsername(String username) {
            this.username = username;
        }
        
        public String getUsername() {
            return username;
        }
        
        public void incrementRequestCount() {
            requestCount++;
        }
        
        public int getRequestCount() {
            return requestCount;
        }
    }
    
    /**
     * Gets the thread-specific ID.
     *
     * @return This thread's unique ID
     */
    public int getThreadId() {
        return threadId.get();
    }
    
    /**
     * Gets the thread-specific user context.
     *
     * @return This thread's user context
     */
    public UserContext getUserContext() {
        return userContext.get();
    }
    
    /**
     * Simulates processing a request for this thread.
     */
    public void processRequest(String user) {
        UserContext context = getUserContext();
        context.setUsername(user);
        context.incrementRequestCount();
        
        System.out.println("Thread " + getThreadId() + 
            " processing request for " + context.getUsername() +
            " (request #" + context.getRequestCount() + ")");
    }
    
    /**
     * Demonstrates the ThreadSpecificStorage pattern.
     */
    public void demonstrate() {
        System.out.println("=== ThreadSpecificStorage Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Thread-Local IDs");
        System.out.println("-".repeat(50));
        
        Thread[] threads = new Thread[3];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> {
                System.out.println(Thread.currentThread().getName() + 
                    " has ID: " + getThreadId());
            }, "Thread-" + i);
            threads[i].start();
        }
        
        for (Thread t : threads) {
            try { t.join(); } catch (InterruptedException e) {}
        }
        
        System.out.println("\nScenario 2: Thread-Local User Contexts");
        System.out.println("-".repeat(50));
        
        Thread user1 = new Thread(() -> {
            processRequest("Alice");
            processRequest("Alice");
            processRequest("Alice");
        }, "UserThread-1");
        
        Thread user2 = new Thread(() -> {
            processRequest("Bob");
            processRequest("Bob");
        }, "UserThread-2");
        
        user1.start();
        user2.start();
        
        try {
            user1.join();
            user2.join();
        } catch (InterruptedException e) {}
        
        System.out.println("\nThreadSpecificStorage demonstration complete");
    }
}
