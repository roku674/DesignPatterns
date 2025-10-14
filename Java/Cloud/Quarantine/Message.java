package Cloud.Quarantine;

public class Message {
    private final String id;
    private final String payload;
    private int retryCount = 0;
    
    public Message(String id, String payload) {
        this.id = id;
        this.payload = payload;
    }
    
    public String getId() { return id; }
    public String getPayload() { return payload; }
    public int getRetryCount() { return retryCount; }
    public void incrementRetry() { retryCount++; }
}
