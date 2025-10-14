package Cloud.AsynchronousRequestReply;
import java.util.UUID;

public class AsyncClient {
    private final MessageQueue queue;
    
    public AsyncClient(MessageQueue queue) {
        this.queue = queue;
    }
    
    public String submitJob(String payload) {
        String jobId = UUID.randomUUID().toString();
        queue.sendRequest(new Message(jobId, payload));
        System.out.println("  Submitted job: " + jobId + " (" + payload + ")");
        return jobId;
    }
    
    public String pollResult(String jobId, long timeoutMillis) throws InterruptedException {
        long start = System.currentTimeMillis();
        while ((System.currentTimeMillis() - start) < timeoutMillis) {
            String result = queue.getResponse(jobId);
            if (result != null) {
                return result;
            }
            Thread.sleep(100);
        }
        return "TIMEOUT";
    }
}
