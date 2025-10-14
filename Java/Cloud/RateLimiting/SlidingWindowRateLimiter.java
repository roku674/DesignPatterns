package Cloud.RateLimiting;
import java.time.Duration;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class SlidingWindowRateLimiter {
    private final int maxRequests;
    private final Duration window;
    private final Queue<Long> timestamps = new ConcurrentLinkedQueue<>();
    
    public SlidingWindowRateLimiter(int maxRequests, Duration window) {
        this.maxRequests = maxRequests;
        this.window = window;
    }
    
    public boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStart = now - window.toMillis();
        
        timestamps.removeIf(time -> time < windowStart);
        
        if (timestamps.size() < maxRequests) {
            timestamps.offer(now);
            return true;
        }
        return false;
    }
}
