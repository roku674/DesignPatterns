package Cloud.RateLimiting;
import java.time.Duration;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class LeakyBucketRateLimiter {
    private final int capacity;
    private final Duration leakInterval;
    private final Queue<Long> bucket = new ConcurrentLinkedQueue<>();
    
    public LeakyBucketRateLimiter(int capacity, Duration leakInterval) {
        this.capacity = capacity;
        this.leakInterval = leakInterval;
    }
    
    public boolean tryAcquire() {
        leak();
        if (bucket.size() < capacity) {
            bucket.offer(System.currentTimeMillis());
            return true;
        }
        return false;
    }
    
    private void leak() {
        long now = System.currentTimeMillis();
        while (!bucket.isEmpty()) {
            Long timestamp = bucket.peek();
            if (timestamp != null && (now - timestamp) >= leakInterval.toMillis()) {
                bucket.poll();
            } else {
                break;
            }
        }
    }
}
