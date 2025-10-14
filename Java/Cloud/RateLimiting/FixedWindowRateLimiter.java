package Cloud.RateLimiting;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class FixedWindowRateLimiter {
    private final int maxRequests;
    private final Duration window;
    private final AtomicInteger counter = new AtomicInteger(0);
    private final AtomicLong windowStart = new AtomicLong(System.currentTimeMillis());
    
    public FixedWindowRateLimiter(int maxRequests, Duration window) {
        this.maxRequests = maxRequests;
        this.window = window;
    }
    
    public boolean tryAcquire() {
        long now = System.currentTimeMillis();
        long windowStartTime = windowStart.get();
        
        if ((now - windowStartTime) >= window.toMillis()) {
            counter.set(0);
            windowStart.set(now);
        }
        
        return counter.incrementAndGet() <= maxRequests;
    }
}
