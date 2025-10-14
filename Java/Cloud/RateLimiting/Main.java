package Cloud.RateLimiting;

import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Demonstrates the Rate Limiting Pattern.
 * 
 * Controls resource consumption and prevents system overload by limiting
 * the rate of requests.
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Rate Limiting Pattern Demo ===\n");
        
        demonstrateTokenBucket();
        demonstrateLeakyBucket();
        demonstrateFixedWindow();
        demonstrateSlidingWindow();
        demonstrateConcurrentRequests();
        demonstrateCloudScenarios();
        
        System.out.println("\n=== Rate Limiting Complete ===");
    }
    
    private static void demonstrateTokenBucket() {
        System.out.println("\n--- Token Bucket Algorithm ---");
        TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(5, 2);
        
        for (int i = 1; i <= 10; i++) {
            boolean allowed = limiter.tryAcquire();
            System.out.println("Request " + i + ": " + (allowed ? "ALLOWED" : "REJECTED"));
            sleep(300);
        }
    }
    
    private static void demonstrateLeakyBucket() {
        System.out.println("\n--- Leaky Bucket Algorithm ---");
        LeakyBucketRateLimiter limiter = new LeakyBucketRateLimiter(10, Duration.ofMillis(200));
        
        for (int i = 1; i <= 8; i++) {
            boolean allowed = limiter.tryAcquire();
            System.out.println("Request " + i + ": " + (allowed ? "ALLOWED" : "REJECTED"));
        }
    }
    
    private static void demonstrateFixedWindow() {
        System.out.println("\n--- Fixed Window Counter ---");
        FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(5, Duration.ofSeconds(2));
        
        for (int i = 1; i <= 12; i++) {
            boolean allowed = limiter.tryAcquire();
            System.out.println("Request " + i + ": " + (allowed ? "ALLOWED" : "REJECTED"));
            sleep(500);
        }
    }
    
    private static void demonstrateSlidingWindow() {
        System.out.println("\n--- Sliding Window Log ---");
        SlidingWindowRateLimiter limiter = new SlidingWindowRateLimiter(5, Duration.ofSeconds(1));
        
        for (int i = 1; i <= 10; i++) {
            boolean allowed = limiter.tryAcquire();
            System.out.println("Request " + i + ": " + (allowed ? "ALLOWED" : "REJECTED"));
            sleep(200);
        }
    }
    
    private static void demonstrateConcurrentRequests() {
        System.out.println("\n--- Concurrent Rate Limiting ---");
        TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(10, 5);
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        for (int i = 1; i <= 20; i++) {
            int requestId = i;
            executor.submit(() -> {
                boolean allowed = limiter.tryAcquire();
                System.out.println("  [Thread-" + requestId + "] " + (allowed ? "ALLOWED" : "REJECTED"));
            });
        }
        
        executor.shutdown();
        sleep(2000);
    }
    
    private static void demonstrateCloudScenarios() {
        System.out.println("\n--- Cloud API Scenarios ---");
        
        System.out.println("\n1. AWS API Gateway (100 req/sec):");
        RateLimitedService awsApi = new RateLimitedService("AWS-API", 100, Duration.ofSeconds(1));
        for (int i = 0; i < 5; i++) {
            awsApi.handleRequest("api-" + i);
        }
        
        System.out.println("\n2. Azure Function (1000 req/min):");
        RateLimitedService azureFunc = new RateLimitedService("Azure-Func", 1000, Duration.ofMinutes(1));
        for (int i = 0; i < 3; i++) {
            azureFunc.handleRequest("func-" + i);
        }
        
        System.out.println("\n3. GCP Cloud Run (10 concurrent):");
        ConcurrencyRateLimiter gcpRun = new ConcurrencyRateLimiter(10);
        for (int i = 0; i < 5; i++) {
            try {
                gcpRun.execute(() -> {
                    System.out.println("  Processing request...");
                    sleep(100);
                    return "Done";
                });
            } catch (Exception e) {
                System.out.println("  Rate limited: " + e.getMessage());
            }
        }
    }
    
    private static void sleep(long millis) {
        try { Thread.sleep(millis); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
