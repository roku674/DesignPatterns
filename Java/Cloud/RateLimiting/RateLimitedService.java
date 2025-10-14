package Cloud.RateLimiting;
import java.time.Duration;

public class RateLimitedService {
    private final String name;
    private final TokenBucketRateLimiter limiter;
    
    public RateLimitedService(String name, int maxRequests, Duration period) {
        this.name = name;
        double ratePerSecond = (double) maxRequests / period.getSeconds();
        this.limiter = new TokenBucketRateLimiter(maxRequests, ratePerSecond);
    }
    
    public void handleRequest(String requestId) {
        if (limiter.tryAcquire()) {
            System.out.println("  " + name + " processing: " + requestId);
        } else {
            System.out.println("  " + name + " RATE LIMITED: " + requestId);
        }
    }
}
