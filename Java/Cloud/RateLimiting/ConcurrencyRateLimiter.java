package Cloud.RateLimiting;
import java.util.concurrent.Semaphore;
import java.util.concurrent.Callable;

public class ConcurrencyRateLimiter {
    private final Semaphore semaphore;
    
    public ConcurrencyRateLimiter(int maxConcurrent) {
        this.semaphore = new Semaphore(maxConcurrent);
    }
    
    public <T> T execute(Callable<T> task) throws Exception {
        if (semaphore.tryAcquire()) {
            try {
                return task.call();
            } finally {
                semaphore.release();
            }
        } else {
            throw new RateLimitException("Concurrency limit exceeded");
        }
    }
}
