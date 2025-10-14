package Cloud.RateLimiting;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TokenBucketRateLimiter {
    private final int capacity;
    private final double refillRate;
    private final AtomicInteger tokens;
    private final AtomicLong lastRefillTime;
    
    public TokenBucketRateLimiter(int capacity, double refillRatePerSecond) {
        this.capacity = capacity;
        this.refillRate = refillRatePerSecond;
        this.tokens = new AtomicInteger(capacity);
        this.lastRefillTime = new AtomicLong(System.currentTimeMillis());
    }
    
    public boolean tryAcquire() {
        refill();
        int currentTokens = tokens.get();
        if (currentTokens > 0) {
            tokens.decrementAndGet();
            return true;
        }
        return false;
    }
    
    private void refill() {
        long now = System.currentTimeMillis();
        long lastRefill = lastRefillTime.get();
        double elapsedSeconds = (now - lastRefill) / 1000.0;
        int tokensToAdd = (int) (elapsedSeconds * refillRate);
        
        if (tokensToAdd > 0) {
            int newTokens = Math.min(capacity, tokens.get() + tokensToAdd);
            tokens.set(newTokens);
            lastRefillTime.set(now);
        }
    }
}
