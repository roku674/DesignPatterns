package Cloud.Quarantine;

public class MessageProcessor {
    private final QuarantineQueue quarantineQueue;
    private static final int MAX_RETRIES = 3;
    
    public MessageProcessor(QuarantineQueue quarantineQueue) {
        this.quarantineQueue = quarantineQueue;
    }
    
    public void process(Message message) {
        try {
            if (message.getPayload().contains("corrupt") || message.getPayload().contains("malformed")) {
                throw new Exception("Invalid message format");
            }
            System.out.println("  ✓ Processed: " + message.getId());
        } catch (Exception e) {
            message.incrementRetry();
            if (message.getRetryCount() >= MAX_RETRIES) {
                System.out.println("  ✗ Failed after " + MAX_RETRIES + " retries: " + message.getId());
                quarantineQueue.quarantine(message);
            } else {
                System.out.println("  ⟳ Retry " + message.getRetryCount() + ": " + message.getId());
            }
        }
    }
}
