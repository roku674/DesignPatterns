package Cloud.AsynchronousRequestReply;

public class AsyncProcessor implements Runnable {
    private final MessageQueue queue;
    private volatile boolean running = true;
    
    public AsyncProcessor(MessageQueue queue) {
        this.queue = queue;
    }
    
    public void run() {
        while (running) {
            try {
                Message message = queue.receiveRequest();
                if (message != null) {
                    System.out.println("  Processing: " + message.getJobId());
                    Thread.sleep(1000); // Simulate work
                    String result = "Completed: " + message.getPayload();
                    queue.sendResponse(message.getJobId(), result);
                    System.out.println("  Completed: " + message.getJobId());
                }
            } catch (InterruptedException e) {
                break;
            }
        }
    }
    
    public void stop() {
        running = false;
    }
}
