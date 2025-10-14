package Cloud.AsynchronousRequestReply;
import java.util.UUID;
import java.util.concurrent.*;

/**
 * Asynchronous Request-Reply Pattern
 * Client sends request and receives response asynchronously.
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Asynchronous Request-Reply Pattern ===\n");
        
        MessageQueue queue = new MessageQueue();
        AsyncProcessor processor = new AsyncProcessor(queue);
        AsyncClient client = new AsyncClient(queue);
        
        // Start processor
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.submit(processor);
        
        // Send requests
        System.out.println("1. Sending async requests:");
        String jobId1 = client.submitJob("Process-Order-123");
        String jobId2 = client.submitJob("Generate-Report-456");
        
        System.out.println("\n2. Polling for results:");
        String result1 = client.pollResult(jobId1, 5000);
        String result2 = client.pollResult(jobId2, 5000);
        
        System.out.println("\n3. Results received:");
        System.out.println("  Job1: " + result1);
        System.out.println("  Job2: " + result2);
        
        processor.stop();
        executor.shutdown();
    }
}
