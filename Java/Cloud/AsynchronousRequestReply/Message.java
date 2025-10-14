package Cloud.AsynchronousRequestReply;

public class Message {
    private final String jobId;
    private final String payload;
    
    public Message(String jobId, String payload) {
        this.jobId = jobId;
        this.payload = payload;
    }
    
    public String getJobId() { return jobId; }
    public String getPayload() { return payload; }
}
