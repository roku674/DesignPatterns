package Cloud.AsynchronousRequestReply;
import java.util.concurrent.*;

public class MessageQueue {
    private BlockingQueue<Message> requestQueue = new LinkedBlockingQueue<>();
    private ConcurrentHashMap<String, String> responseStore = new ConcurrentHashMap<>();
    
    public void sendRequest(Message message) {
        requestQueue.offer(message);
    }
    
    public Message receiveRequest() throws InterruptedException {
        return requestQueue.poll(100, TimeUnit.MILLISECONDS);
    }
    
    public void sendResponse(String jobId, String result) {
        responseStore.put(jobId, result);
    }
    
    public String getResponse(String jobId) {
        return responseStore.get(jobId);
    }
}
